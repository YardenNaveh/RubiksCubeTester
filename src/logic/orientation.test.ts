import {
    generateOrientationProblem,
    determineFullOrientation, // Keep if you want to test internal helpers
  } from './orientation';
  import { COLORS, COLOR_PAIRS, TARGET_RELATIONS, ADJACENT_FACES } from './cubeConstants';

  describe('Cube Orientation Logic', () => {

    // Optional: Test the internal helper if needed
    describe('determineFullOrientation (White-Down Fixed)', () => {
      it('should correctly determine faces for Front=Red, Right=Blue', () => {
        const orientation = determineFullOrientation('red', 'blue');
        expect(orientation.up).toBe('yellow'); // White is Down
        expect(orientation.down).toBe('white');
        expect(orientation.left).toBe('green');
        expect(orientation.back).toBe('orange');
      });

      it('should correctly determine faces for Front=Green, Right=White', () => {
        const orientation = determineFullOrientation('green', 'white');
        expect(orientation.up).toBe('orange');
        expect(orientation.down).toBe('red');
        expect(orientation.left).toBe('yellow');
        expect(orientation.back).toBe('blue');
      });

      it('should throw error for non-adjacent faces', () => {
        expect(() => determineFullOrientation('red', 'orange')).toThrow();
      });
    });

    describe('generateOrientationProblem', () => {
      it('should generate a valid problem structure', () => {
        const problem = generateOrientationProblem();
        expect(problem).toHaveProperty('frontFaceColor');
        expect(problem).toHaveProperty('rightFaceColor');
        expect(problem).toHaveProperty('targetRelation');
        expect(problem).toHaveProperty('correctAnswer');
        expect(problem).toHaveProperty('upFaceColor');
        expect(problem).toHaveProperty('leftFaceColor');
        expect(problem).toHaveProperty('downFaceColor');
        expect(problem).toHaveProperty('backFaceColor');

        expect(COLORS).toContain(problem.frontFaceColor);
        expect(COLORS).toContain(problem.rightFaceColor);
        expect(problem).toHaveProperty('correctAnswer');
        expect(TARGET_RELATIONS).toContain(problem.targetRelation);
      });

      it('should ensure Front and Right faces are adjacent', () => {
        for (let i = 0; i < 20; i++) { // Run multiple times for randomness
          const problem = generateOrientationProblem();
          expect(ADJACENT_FACES[problem.frontFaceColor]).toContain(problem.rightFaceColor);
          expect(problem.rightFaceColor).not.toBe(COLOR_PAIRS[problem.frontFaceColor]);
        }
      });

      // Test 10 random orientations as requested
      it('should compute the correct answer for 10 random orientations', () => {
        for (let i = 0; i < 10; i++) {
          const problem = generateOrientationProblem();
          // Re-calculate the orientation based on the generated Front/Right to verify
          const verificationOrientation = determineFullOrientation(
            problem.frontFaceColor,
            problem.rightFaceColor
          );
          // Check if the correctAnswer stored in the problem matches the re-calculated color for the targetRelation
          expect(problem.correctAnswer).toBe(verificationOrientation[problem.targetRelation]);
          // Also verify all derived faces match
          expect(problem.upFaceColor).toBe(verificationOrientation.up);
          expect(problem.downFaceColor).toBe(verificationOrientation.down);
          expect(problem.leftFaceColor).toBe(verificationOrientation.left);
          expect(problem.backFaceColor).toBe(verificationOrientation.back);
        }
      });
    });
  }); 