import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastNotificationProvider, useToast } from './ToastNotificationContext';
import React from 'react';

// Test component to access the toast context
const TestComponent: React.FC = () => {
  const { addToast } = useToast();

  return (
    <button
      onClick={() =>
        addToast({
          title: 'Test Toast',
          message: 'This is a test message',
          variant: 'success',
        })
      }
    >
      Show Toast
    </button>
  );
};

describe('ToastNotificationContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should add a toast notification when addToast is called', () => {
    render(
      <ToastNotificationProvider>
        <TestComponent />
      </ToastNotificationProvider>
    );

    const button = screen.getByText('Show Toast');
    act(() => {
      button.click();
    });

    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
  });

  it('should auto-dismiss toast after timeout', () => {
    render(
      <ToastNotificationProvider>
        <TestComponent />
      </ToastNotificationProvider>
    );

    const button = screen.getByText('Show Toast');
    act(() => {
      button.click();
    });

    expect(screen.getByText('Test Toast')).toBeInTheDocument();

    // Fast-forward time by 4 seconds (auto-dismiss timeout)
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
  });

  it('should stack multiple toasts vertically', () => {
    const MultiToastComponent: React.FC = () => {
      const { addToast } = useToast();

      return (
        <button
          onClick={() => {
            addToast({
              title: 'First Toast',
              message: 'First message',
              variant: 'success',
            });
            addToast({
              title: 'Second Toast',
              message: 'Second message',
              variant: 'error',
            });
          }}
        >
          Show Multiple Toasts
        </button>
      );
    };

    render(
      <ToastNotificationProvider>
        <MultiToastComponent />
      </ToastNotificationProvider>
    );

    const button = screen.getByText('Show Multiple Toasts');
    act(() => {
      button.click();
    });

    expect(screen.getByText('First Toast')).toBeInTheDocument();
    expect(screen.getByText('Second Toast')).toBeInTheDocument();
  });

  it('should render different variants with appropriate styling', () => {
    const VariantTestComponent: React.FC = () => {
      const { addToast } = useToast();

      return (
        <>
          <button
            onClick={() =>
              addToast({
                title: 'Success',
                message: 'Success message',
                variant: 'success',
              })
            }
          >
            Success Toast
          </button>
          <button
            onClick={() =>
              addToast({
                title: 'Error',
                message: 'Error message',
                variant: 'error',
              })
            }
          >
            Error Toast
          </button>
          <button
            onClick={() =>
              addToast({
                title: 'Warning',
                message: 'Warning message',
                variant: 'warning',
              })
            }
          >
            Warning Toast
          </button>
          <button
            onClick={() =>
              addToast({
                title: 'Info',
                message: 'Info message',
                variant: 'info',
              })
            }
          >
            Info Toast
          </button>
        </>
      );
    };

    render(
      <ToastNotificationProvider>
        <VariantTestComponent />
      </ToastNotificationProvider>
    );

    act(() => {
      screen.getByText('Success Toast').click();
    });
    expect(screen.getByText('Success')).toBeInTheDocument();

    act(() => {
      screen.getByText('Error Toast').click();
    });
    expect(screen.getByText('Error')).toBeInTheDocument();

    act(() => {
      screen.getByText('Warning Toast').click();
    });
    expect(screen.getByText('Warning')).toBeInTheDocument();

    act(() => {
      screen.getByText('Info Toast').click();
    });
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('should throw error when useToast is used outside provider', () => {
    const InvalidComponent: React.FC = () => {
      useToast();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<InvalidComponent />)).toThrow(
      'useToast must be used within a ToastNotificationProvider'
    );

    consoleError.mockRestore();
  });
});
