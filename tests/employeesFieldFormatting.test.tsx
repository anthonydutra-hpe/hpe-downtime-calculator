import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputForm from '@/components/InputForm';

describe('InputForm employees field formatting', () => {
  test('displays employees as grouped integer (e.g., 1,234) not currency', () => {
    const mockOnChange = jest.fn();
    const inputs = {
      annualRevenue: 1000000,
      lostRevenuePerHour: null,
      employees: 1234,
      avgHourlySalary: null,
      targetRTO: 4,
      targetRPO: 4,
      dataFootprintTB: 100,
      industry: 'other',
      hasVMs: false,
      vmCount: null,
      missionCriticalVmCount: null,
      requiresImmutability: false,
      requiresAirGap: false,
      hoursDowntime: null,
      pctRevenueImpacted: null,
    };

    const { container } = render(
      <InputForm value={inputs} onChange={mockOnChange} />
    );

    // Find the Employees input
    const employeesInputs = screen.getAllByPlaceholderText('e.g. 1000');
    const employeesInput = employeesInputs[0] as HTMLInputElement;

    // Should display as "1,234" not "$1,234"
    expect(employeesInput.value).toBe('1,234');
    expect(employeesInput.value).not.toContain('$');
  });

  test('employees input blurs to grouped integer format', () => {
    const mockOnChange = jest.fn();
    const inputs = {
      annualRevenue: null,
      lostRevenuePerHour: null,
      employees: null,
      avgHourlySalary: null,
      targetRTO: 4,
      targetRPO: 4,
      dataFootprintTB: 100,
      industry: 'other',
      hasVMs: false,
      vmCount: null,
      missionCriticalVmCount: null,
      requiresImmutability: false,
      requiresAirGap: false,
      hoursDowntime: null,
      pctRevenueImpacted: null,
    };

    render(<InputForm value={inputs} onChange={mockOnChange} />);

    // Find the Employees input
    const employeesInputs = screen.getAllByPlaceholderText('e.g. 1000');
    const employeesInput = employeesInputs[0] as HTMLInputElement;

    // Type a value
    fireEvent.focus(employeesInput);
    fireEvent.change(employeesInput, { target: { value: '5678' } });
    
    // Blur to trigger formatting
    fireEvent.blur(employeesInput);

    // Should have called onChange with the integer value 5678
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ employees: 5678 })
    );
  });

  test('other fields still display with currency formatting', () => {
    const mockOnChange = jest.fn();
    const inputs = {
      annualRevenue: 1000000,
      lostRevenuePerHour: 5000,
      employees: 500,
      avgHourlySalary: 75,
      targetRTO: 4,
      targetRPO: 4,
      dataFootprintTB: 100,
      industry: 'other',
      hasVMs: false,
      vmCount: null,
      missionCriticalVmCount: null,
      requiresImmutability: false,
      requiresAirGap: false,
      hoursDowntime: null,
      pctRevenueImpacted: null,
    };

    render(<InputForm value={inputs} onChange={mockOnChange} />);

    // Find the Annual Revenue input (should display with $)
    const revenueInput = screen.getByDisplayValue('$1,000,000') as HTMLInputElement;
    expect(revenueInput).toBeInTheDocument();
    expect(revenueInput.value).toContain('$');

    // Find the Avg Hourly Salary input (should display with $)
    const salaryInput = screen.getByDisplayValue('$75.00') as HTMLInputElement;
    expect(salaryInput).toBeInTheDocument();
    expect(salaryInput.value).toContain('$');
  });

  test('employees parses input with commas correctly', () => {
    const mockOnChange = jest.fn();
    const inputs = {
      annualRevenue: null,
      lostRevenuePerHour: null,
      employees: null,
      avgHourlySalary: null,
      targetRTO: 4,
      targetRPO: 4,
      dataFootprintTB: 100,
      industry: 'other',
      hasVMs: false,
      vmCount: null,
      missionCriticalVmCount: null,
      requiresImmutability: false,
      requiresAirGap: false,
      hoursDowntime: null,
      pctRevenueImpacted: null,
    };

    render(<InputForm value={inputs} onChange={mockOnChange} />);

    const employeesInputs = screen.getAllByPlaceholderText('e.g. 1000');
    const employeesInput = employeesInputs[0] as HTMLInputElement;

    // Type with commas already in it (simulating paste from formatted value)
    fireEvent.focus(employeesInput);
    fireEvent.change(employeesInput, { target: { value: '10,000' } });
    fireEvent.blur(employeesInput);

    // Should parse correctly to 10000
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ employees: 10000 })
    );
  });
});
