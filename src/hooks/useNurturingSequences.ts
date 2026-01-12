import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NurturingSequence {
  id: string;
  step_number: number;
  name: string;
  email_subject: string;
  delay_hours: number;
  source_filter: string | null;
  is_active: boolean;
}

interface CampaignInfo {
  id: string;
  name: string;
  description: string;
  sourceFilter: string | null;
  color: string;
  icon: string;
}

const CAMPAIGN_CONFIG: Record<string, CampaignInfo> = {
  default: {
    id: "default",
    name: "Sequência Padrão",
    description: "Leads capturados organicamente",
    sourceFilter: null,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: "📧",
  },
  jornada_imobiliaria_2026: {
    id: "jornada_imobiliaria_2026",
    name: "Jornada Imobiliária",
    description: "Leads inscritos na Jornada 2026",
    sourceFilter: "jornada_imobiliaria_2026",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: "🏠",
  },
  importação_excel: {
    id: "importação_excel",
    name: "Convite Jornada",
    description: "Leads importados de planilha",
    sourceFilter: "importação_excel",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: "📥",
  },
};

export function useNurturingSequences() {
  const [sequences, setSequences] = useState<NurturingSequence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSequences = async () => {
      const { data, error } = await supabase
        .from("nurturing_sequences")
        .select("id, step_number, name, email_subject, delay_hours, source_filter, is_active")
        .eq("is_active", true)
        .order("step_number", { ascending: true });

      if (data) setSequences(data);
      if (error) console.error("Error fetching nurturing sequences:", error);
      setLoading(false);
    };

    fetchSequences();
  }, []);

  // Group sequences by source_filter for quick lookup
  const sequencesBySource = useMemo(() => {
    const grouped: Record<string, NurturingSequence[]> = {
      default: [],
    };

    sequences.forEach((seq) => {
      const key = seq.source_filter || "default";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(seq);
    });

    // Sort each group by step_number
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.step_number - b.step_number);
    });

    return grouped;
  }, [sequences]);

  // Get campaign info based on lead source
  const getCampaignInfo = useCallback((source: string | null): CampaignInfo => {
    // Check for exact source match
    if (source && CAMPAIGN_CONFIG[source]) {
      return CAMPAIGN_CONFIG[source];
    }
    
    // Check if we have sequences for this source
    if (source && sequencesBySource[source]?.length > 0) {
      return {
        id: source,
        name: source.charAt(0).toUpperCase() + source.slice(1).replace(/_/g, " "),
        description: `Campanha: ${source}`,
        sourceFilter: source,
        color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
        icon: "📋",
      };
    }

    return CAMPAIGN_CONFIG.default;
  }, [sequencesBySource]);

  // Get sequences for a specific source (fallback to default if none)
  const getSequencesForSource = useCallback((source: string | null): NurturingSequence[] => {
    if (source && sequencesBySource[source]?.length > 0) {
      return sequencesBySource[source];
    }
    return sequencesBySource.default || [];
  }, [sequencesBySource]);

  // Get sequence info for a specific lead (source + step)
  const getSequenceInfo = useCallback((source: string | null, step: number) => {
    const sourceSequences = getSequencesForSource(source);
    const maxStep = sourceSequences.length;
    
    // Find the current sequence (step is 1-indexed for display but we need to match)
    // Steps in DB are like 1,2,3,4,5 or 201,202,203,204
    const currentSequence = sourceSequences.find((seq, index) => index + 1 === step);
    const nextSequence = sourceSequences.find((seq, index) => index + 1 === step + 1);

    return {
      currentStep: step,
      maxStep,
      currentName: currentSequence?.name || "Aguardando",
      currentSubject: currentSequence?.email_subject || "",
      nextName: nextSequence?.name || null,
      nextDelayHours: nextSequence?.delay_hours || null,
      isComplete: step >= maxStep,
    };
  }, [getSequencesForSource]);

  // Calculate next send time based on last_contact_at and sequence delay
  const calculateNextSend = useCallback((
    source: string | null, 
    step: number, 
    lastContactAt: string | null
  ): { 
    text: string; 
    hoursRemaining: number | null;
    nextStepName: string | null;
    isUrgent: boolean;
    exactDate: Date | null;
  } | null => {
    const sourceSequences = getSequencesForSource(source);
    const maxStep = sourceSequences.length;

    // If complete, no next send
    if (step >= maxStep) {
      return null;
    }

    // Find the next sequence step
    const nextSequence = sourceSequences.find((seq, index) => index + 1 === step + 1);
    if (!nextSequence) return null;

    // If no last contact, will send soon
    if (!lastContactAt) {
      return { 
        text: "Em breve", 
        hoursRemaining: 0,
        nextStepName: nextSequence.name,
        isUrgent: true,
        exactDate: null,
      };
    }

    // Calculate hours remaining
    const lastContact = new Date(lastContactAt);
    const nextSendTime = new Date(lastContact.getTime() + nextSequence.delay_hours * 60 * 60 * 1000);
    const now = new Date();
    const hoursRemaining = Math.max(0, Math.round((nextSendTime.getTime() - now.getTime()) / (60 * 60 * 1000)));

    if (hoursRemaining <= 0) {
      return { 
        text: "Em breve", 
        hoursRemaining: 0,
        nextStepName: nextSequence.name,
        isUrgent: true,
        exactDate: nextSendTime,
      };
    } else if (hoursRemaining < 24) {
      return { 
        text: `Em ${hoursRemaining}h`, 
        hoursRemaining,
        nextStepName: nextSequence.name,
        isUrgent: hoursRemaining <= 6,
        exactDate: nextSendTime,
      };
    } else {
      const days = Math.floor(hoursRemaining / 24);
      const remainingHours = hoursRemaining % 24;
      return { 
        text: days === 1 ? `Em ${days}d ${remainingHours}h` : `Em ${days}d`, 
        hoursRemaining,
        nextStepName: nextSequence.name,
        isUrgent: false,
        exactDate: nextSendTime,
      };
    }
  }, [getSequencesForSource]);

  return {
    sequences,
    loading,
    getCampaignInfo,
    getSequencesForSource,
    getSequenceInfo,
    calculateNextSend,
    CAMPAIGN_CONFIG,
  };
}
