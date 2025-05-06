import {
    generateOrientationProblem,
    checkAnswer // Import checkAnswer if needed
  } from './orientation';
  import { COLORS, COLOR_PAIRS, FACE_TO_RELATION_MAP } from './cubeConstants';
  import type { Face } from './orientation';

  describe('Cube Orientation Logic', () => {

    describe('generateOrientationProblem', () => {
      it('should generate a valid problem structure for random bottom', () => {
        const problem = generateOrientationProblem('random'); // Pass 'random'
        expect(problem).toHaveProperty('ref1Face');
        expect(problem).toHaveProperty('ref1Color');
        expect(problem).toHaveProperty('ref2Face');
        expect(problem).toHaveProperty('ref2Color');
        expect(problem).toHaveProperty('targetRelation');
        expect(problem).toHaveProperty('correctAnswer');
        expect(problem).toHaveProperty('faceColors');
        expect(problem).toHaveProperty('bottomColor');

        expect(COLORS).toContain(problem.ref1Color);
        expect(COLORS).toContain(problem.ref2Color);
        expect(problem).toHaveProperty('correctAnswer');
        expect(Object.values(FACE_TO_RELATION_MAP)).toContain(problem.targetRelation);
      });

      it('should ensure ref1 and ref2 colors are not opposites', () => {
        for (let i = 0; i < 20; i++) { // Run multiple times for randomness
          const problem = generateOrientationProblem('random');
          expect(problem.ref2Color).not.toBe(COLOR_PAIRS[problem.ref1Color]);
        }
      });

      it('should compute the correct answer for random orientations', () => {
        for (let i = 0; i < 10; i++) {
          const problem = generateOrientationProblem('random');
          const targetFace = Object.entries(FACE_TO_RELATION_MAP).find(([_, rel]) => rel === problem.targetRelation)?.[0] as Face | undefined;
          expect(targetFace).toBeDefined();
          if (!targetFace) continue; // Should not happen
          expect(problem.correctAnswer).toBe(problem.faceColors[targetFace]);
        }
      });

      it('should handle fixed bottom color (white)', () => {
        const problem = generateOrientationProblem('white');
        expect(problem.bottomColor).toBe('white');
        expect(problem.ref1Face).toBe('D');
        expect(problem.ref1Color).toBe('white');
        expect(['F', 'R', 'B', 'L']).toContain(problem.ref2Face);
        const targetFace = Object.entries(FACE_TO_RELATION_MAP).find(([_, rel]) => rel === problem.targetRelation)?.[0] as Face | undefined;
        expect(targetFace).toBeDefined();
        expect(['F', 'R', 'B', 'L']).toContain(targetFace);
        expect(targetFace).not.toBe(problem.ref2Face);
        expect(problem.correctAnswer).toBe(problem.faceColors[targetFace!]);
      });
    });

    describe('checkAnswer', () => {
      it('should return true for correct answer', () => {
        const problem = generateOrientationProblem('white');
        expect(checkAnswer(problem, problem.correctAnswer)).toBe(true);
      });
      it('should return false for incorrect answer', () => {
        const problem = generateOrientationProblem('white');
        const incorrectColor = COLORS.find(c => c !== problem.correctAnswer)!;
        expect(checkAnswer(problem, incorrectColor)).toBe(false);
      });
    });
  }); 