import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Plus, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PollOption {
  text: string;
}

interface PollData {
  question: string;
  options: PollOption[];
}

interface PollCreatorProps {
  onPollCreate: (poll: PollData | null) => void;
  initialPoll?: PollData | null;
}

export const PollCreator = ({ onPollCreate, initialPoll }: PollCreatorProps) => {
  const [showPoll, setShowPoll] = useState(!!initialPoll);
  const [question, setQuestion] = useState(initialPoll?.question || "");
  const [options, setOptions] = useState<string[]>(
    initialPoll?.options.map(o => o.text) || ["", ""]
  );

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      updatePoll(question, newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    updatePoll(question, newOptions);
  };

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
    updatePoll(value, options);
  };

  const updatePoll = (q: string, opts: string[]) => {
    const validOptions = opts.filter(o => o.trim());
    if (q.trim() && validOptions.length >= 2) {
      onPollCreate({
        question: q.trim(),
        options: validOptions.map(text => ({ text }))
      });
    } else {
      onPollCreate(null);
    }
  };

  const handleTogglePoll = () => {
    if (showPoll) {
      setShowPoll(false);
      setQuestion("");
      setOptions(["", ""]);
      onPollCreate(null);
    } else {
      setShowPoll(true);
    }
  };

  const handleRemovePoll = () => {
    setShowPoll(false);
    setQuestion("");
    setOptions(["", ""]);
    onPollCreate(null);
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleTogglePoll}
        className={cn(
          "w-full justify-center gap-2",
          showPoll && "border-secondary text-secondary"
        )}
      >
        <BarChart3 className="w-4 h-4" />
        {showPoll ? "Enquete adicionada" : "Adicionar enquete"}
      </Button>

      <AnimatePresence>
        {showPoll && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-secondary/20 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-cream">Enquete</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemovePoll}
                  className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Input
                  value={question}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  placeholder="Qual a sua pergunta?"
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-cream/70 text-sm">Opções</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Opção ${index + 1}`}
                      className="bg-zinc-900 border-zinc-700"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {options.length < 4 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAddOption}
                    className="w-full text-cream/60 hover:text-cream"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar opção
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PollCreator;