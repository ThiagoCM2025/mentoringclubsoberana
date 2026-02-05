 import { Dialog, DialogContent } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { motion } from "framer-motion";
 import { AlertTriangle, MessageCircle, ArrowRight } from "lucide-react";
 import { RejectionData } from "@/hooks/useRealtimeMissionCelebration";
 
 interface MissionRejectionModalProps {
   isOpen: boolean;
   onClose: () => void;
   rejection: RejectionData | null;
 }
 
 export const MissionRejectionModal = ({
   isOpen,
   onClose,
   rejection,
 }: MissionRejectionModalProps) => {
   if (!rejection) return null;
 
   return (
     <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className="sm:max-w-md bg-zinc-900 border-orange-500/30 p-0 overflow-hidden">
         {/* Header with warning gradient */}
         <div className="relative bg-gradient-to-b from-orange-500/20 via-orange-500/10 to-transparent pt-8 pb-6 px-6">
           <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.3 }}
             className="flex justify-center mb-4"
           >
             <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
               <AlertTriangle className="w-8 h-8 text-orange-400" />
             </div>
           </motion.div>
 
           <motion.div
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.1, duration: 0.3 }}
             className="text-center"
           >
             <p className="text-orange-400 text-sm font-medium mb-1">
               Semana {rejection.weekNumber} • Ajustes Necessários
             </p>
             <h2 className="text-xl font-serif font-bold text-cream">
               "{rejection.missionTitle}"
             </h2>
           </motion.div>
         </div>
 
         {/* Feedback section */}
         <div className="px-6 pb-6">
           {rejection.feedback && (
             <motion.div
               initial={{ y: 10, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.2, duration: 0.3 }}
               className="bg-zinc-800/50 rounded-xl p-4 border border-orange-500/20 mb-4"
             >
               <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                   <MessageCircle className="w-4 h-4 text-orange-400" />
                 </div>
                 <div>
                   <p className="text-xs text-orange-400 font-medium mb-1">
                     Feedback da Mentora
                   </p>
                   <p className="text-cream/80 text-sm leading-relaxed">
                     "{rejection.feedback}"
                   </p>
                 </div>
               </div>
             </motion.div>
           )}
 
           <motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.3, duration: 0.3 }}
             className="text-cream/60 text-sm text-center mb-6"
           >
             Não desanime! Ajustes fazem parte do processo de aprendizado. 
             Revise o feedback e reenvie sua missão. 💪
           </motion.p>
 
           <motion.div
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.4, duration: 0.3 }}
           >
             <Button
               onClick={onClose}
               className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
             >
               Entendi, Vou Corrigir
               <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
           </motion.div>
         </div>
       </DialogContent>
     </Dialog>
   );
 };