import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RadioGroup from './RadioGroup';
import React from 'react';

const mockOptions = [
  { value: 'novice', label: 'Novice' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

describe('RadioGroup', () => {
  it('should render all radio options', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        label="Proficiency Level"
        value="novice"
        onChange={onChange}
        options={mockOptions}
      />
    );

    expect(screen.getByLabelText('Novice')).toBeInTheDocument();
    expect(screen.getByLabelText('Intermediate')).toBeInTheDocument();
    expect(screen.getByLabelText('Advanced')).toBeInTheDocument();
    expect(screen.getByLabelText('Expert')).toBeInTheDocument();
  });

  it('should call onChange when a different option is selected', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        label="Proficiency Level"
        value="novice"
        onChange={onChange}
        options={mockOptions}
      />
    );

    const advancedRadio = screen.getByLabelText('Advanced');
    fireEvent.click(advancedRadio);

    expect(onChange).toHaveBeenCalledWith('advanced');
  });

  it('should show the correct option as selected', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        label="Proficiency Level"
        value="advanced"
        onChange={onChange}
        options={mockOptions}
      />
    );

    const advancedRadio = screen.getByLabelText('Advanced') as HTMLInputElement;
    expect(advancedRadio.checked).toBe(true);

    const noviceRadio = screen.getByLabelText('Novice') as HTMLInputElement;
    expect(noviceRadio.checked).toBe(false);
  });

  it('should support keyboard navigation with arrow keys', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        label="Proficiency Level"
        value="novice"
        onChange={onChange}
        options={mockOptions}
      />
    );

    const noviceRadio = screen.getByLabelText('Novice');
    noviceRadio.focus();

    // Press ArrowDown to move to next option
    fireEvent.keyDown(noviceRadio, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith('intermediate');

    // Reset mock
    onChange.mockClear();

    // Press ArrowUp from intermediate position
    const intermediateRadio = screen.getByLabelText('Intermediate');
    intermediateRadio.focus();
    fireEvent.keyDown(intermediateRadio, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith('novice');
  });

  it('should render in horizontal layout when layout prop is horizontal', () => {
    const onChange = vi.fn();
    const { container } = render(
      <RadioGroup
        label="Proficiency Level"
        value="novice"
        onChange={onChange}
        options={mockOptions}
        layout="horizontal"
      />
    );

    const optionsContainer = container.querySelector('[role="radiogroup"]');
    expect(optionsContainer).toHaveClass('flex-row');
  });

  it('should disable all radio options when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        label="Proficiency Level"
        value="novice"
        onChange={onChange}
        options={mockOptions}
        disabled={true}
      />
    );

    const noviceRadio = screen.getByLabelText('Novice') as HTMLInputElement;
    const intermediateRadio = screen.getByLabelText('Intermediate') as HTMLInputElement;

    expect(noviceRadio.disabled).toBe(true);
    expect(intermediateRadio.disabled).toBe(true);

    // Try to click and verify onChange is not called
    fireEvent.click(intermediateRadio);
    expect(onChange).not.toHaveBeenCalled();
  });
});
