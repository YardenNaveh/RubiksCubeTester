import { X } from 'lucide-react';
import { LAST_DEPLOYMENT } from '../config/deploymentInfo';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

function formatDeploymentDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getGameHelp(path: string): { title: string; content: React.ReactNode } {
  if (path.startsWith('/edge-kata')) {
    return {
      title: 'EO Kata - Edge Orientation',
      content: (
        <div className="space-y-3">
          <p>Practice recognizing <strong>good</strong> vs <strong>bad</strong> edges — edges that can be solved using only <strong>R, L, U, and D</strong> moves.</p>
          
          <h3 className="font-semibold text-sky-400">Finding the Important Sticker</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>If the edge has a <strong>U or D color</strong> → that sticker is important</li>
            <li>Otherwise → the <strong>F or B colored</strong> sticker is important</li>
          </ul>

          <h3 className="font-semibold text-sky-400">Classification Rule</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Edge in U/D layer:</strong> Good if important sticker faces U or D</li>
            <li><strong>Edge in middle layer:</strong> Good if important sticker faces F or B</li>
          </ul>

          <p className="text-sm text-slate-400">
            The highlighted edge with dots/X marks is the one you need to classify.
          </p>
        </div>
      ),
    };
  }

  if (path.startsWith('/f2l')) {
    return {
      title: 'F2L Pair Ninja',
      content: (
        <div className="space-y-3">
          <p>Practice spotting <strong>F2L corner-edge pairs</strong> quickly.</p>
          
          <h3 className="font-semibold text-sky-400">How to Play</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>The cube shows a scrambled position with the <strong>cross solved</strong></li>
            <li>Find all <strong>4 F2L pairs</strong> (corner + matching edge)</li>
            <li>Click on both pieces of a pair to select them</li>
            <li>Correct pairs disappear, wrong selections show an error</li>
          </ul>

          <h3 className="font-semibold text-sky-400">What's a Pair?</h3>
          <p className="text-sm">
            A corner and edge that share the same two side colors (excluding bottom color).
            For example: white-red-blue corner pairs with red-blue edge.
          </p>
        </div>
      ),
    };
  }

  // Default: Color Sensei
  return {
    title: 'Color Sensei',
    content: (
      <div className="space-y-3">
        <p>Train your brain to <strong>instantly recognize</strong> cube face colors.</p>
        
        <h3 className="font-semibold text-sky-400">How to Play</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>You're shown two reference faces and their colors</li>
          <li>Determine what color is on the <strong>target face</strong></li>
          <li>Tap the correct color as fast as you can</li>
        </ul>

        <h3 className="font-semibold text-sky-400">Tips</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Build a mental model of the cube</li>
          <li>Practice with different bottom colors</li>
          <li>Speed comes with familiarity</li>
        </ul>
      </div>
    ),
  };
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, currentPath }) => {
  if (!isOpen) return null;

  const { title, content } = getGameHelp(currentPath);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700"
            aria-label="Close"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        
        <div className="p-4 text-slate-200">
          {content}
        </div>

        <div className="p-4 border-t border-slate-700 text-center">
          <p className="text-xs text-slate-500">
            Last updated: {formatDeploymentDate(LAST_DEPLOYMENT)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
