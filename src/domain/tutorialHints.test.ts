import { describe, it, expect } from 'vitest';
import { TutorialHintManager } from './tutorialHints';

describe('TutorialHintManager Domain (BDD & TDD)', () => {
  it('Given initial hint manager, When created, Then should have a list of beginner hints', () => {
    const manager = new TutorialHintManager();
    const hints = manager.getAllHints();
    expect(hints.length).toBeGreaterThan(3);
    expect(manager.getCurrentHint()).toBeDefined();
    expect(manager.getCurrentHint().text).toContain('見回');
  });

  it('Given current hint, When nextHint is called, Then advances to the next hint in cycle', () => {
    const manager = new TutorialHintManager();
    const firstHint = manager.getCurrentHint();
    const secondHint = manager.nextHint();

    expect(secondHint.id).not.toBe(firstHint.id);
    expect(manager.getCurrentIndex()).toBe(1);
  });

  it('Given last hint, When nextHint is called, Then loops back to the first hint', () => {
    const manager = new TutorialHintManager();
    const total = manager.getAllHints().length;
    for (let i = 0; i < total; i++) {
      manager.nextHint();
    }
    expect(manager.getCurrentIndex()).toBe(0);
  });

  it('Given hint manager, When dismissed, Then hides active hint banner', () => {
    const manager = new TutorialHintManager();
    expect(manager.isVisible()).toBe(true);
    manager.dismiss();
    expect(manager.isVisible()).toBe(false);
    manager.show();
    expect(manager.isVisible()).toBe(true);
  });
});
