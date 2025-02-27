export default function HowItWorksModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#d7d7d7]/40 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        <div 
          onClick={onClose}
          className="absolute top-4 right-4 w-6 h-6 cursor-pointer"
        >
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white transform -rotate-45"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white transform rotate-45"></div>
        </div>
        
        <div className="text-center mb-8 mt-2">
          <h2 className="text-2xl text-white">How it Works</h2>
        </div>
        
        <div className="text-white space-y-4 px-4 sm:px-6">
          <p className="text-base font-medium">
            We're going to drain the financial system with one simple game. This is Blackhole.
          </p>
          
          <p className="text-sm">
            We funded a pool with $10,000 in USDC. The game starts with anyone being able to bid $100 plus fees for the pool. As soon as that bid is placed, anyone can bid $200 plus fees for the pool. Bids continue to increase in increments of $100.
          </p>
          
          <p className="text-sm">
            If an hour passes without a bid, the previous bidder can claim the pool. Once someone is outbid, they are immediately refunded their bid, minus the fees.
          </p>
          
          <p className="text-sm">
            With each bid, a 1% fee is taken and added to the pool. This means that the pool will ALWAYS be greater than the next bid, attracting more and more capital.
          </p>
          
          <p className="text-sm">
            Another 1% fee is taken with each bid to pay the devs and help fund future financial games.
          </p>
        </div>
      </div>
    </div>
  );
} 