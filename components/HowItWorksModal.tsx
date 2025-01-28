export default function HowItWorksModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#d7d7d7]/40 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-white">How it Works</h2>
          <button 
            onClick={onClose}
            className="text-white text-2xl hover:opacity-80 transition-opacity bg-transparent"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
} 