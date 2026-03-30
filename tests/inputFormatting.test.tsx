import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import InputForm from '../components/InputForm'

describe('InputForm - Currency Formatting', () => {
  test('displays formatted currency ($10,000) when not editing', () => {
    const mockOnChange = jest.fn()
    const value = {
      annualRevenue: 10000,
      lostRevenuePerHour: null,
      targetRTO: null,
      targetRPO: null,
      dataFootprintTB: null,
      industry: 'other',
      hasVMs: false,
      vmCount: null,
      missionCriticalVmCount: null,
      requiresImmutability: false,
      requiresAirGap: false,
      hoursDowntime: null,
      pctRevenueImpacted: null,
      employees: null,
      avgHourlySalary: null,
    }

    render(<InputForm value={value} onChange={mockOnChange} />)

    const input = screen.getByPlaceholderText('e.g. 100000000') as HTMLInputElement
    expect(input.value).toBe('$10,000')
  })

  test('displays unformatted number when focused for editing', () => {
    const mockOnChange = jest.fn()
    const value = {
      annualRevenue: 10000,
      lostRevenuePerHour: null,
      targetRTO: null,
      targetRPO: null,
      dataFootprintTB: null,
      industry: 'other',
      hasVMs: false,
      vmCount: null,
      missionCriticalVmCount: null,
      requiresImmutability: false,
      requiresAirGap: false,
      hoursDowntime: null,
      pctRevenueImpacted: null,
      employees: null,
      avgHourlySalary: null,
    }

    render(<InputForm value={value} onChange={mockOnChange} />)

    const input = screen.getByPlaceholderText('e.g. 100000000') as HTMLInputElement
    fireEvent.focus(input)
    expect(input.value).toBe('10000')
  })

  test('displays salary with 2 decimal places ($50.50)', () => {
    const mockOnChange = jest.fn()
    const value = {
      annualRevenue: null,
      lostRevenuePerHour: null,
      targetRTO: null,
      targetRPO: null,
      dataFootprintTB: null,
      industry: 'other',
      hasVMs: false,
      vmCount: null,
      missionCriticalVmCount: null,
      requiresImmutability: false,
      requiresAirGap: false,
      hoursDowntime: null,
      pctRevenueImpacted: null,
      employees: null,
      avgHourlySalary: 50.5,
    }

    render(<InputForm value={value} onChange={mockOnChange} />)

    const salaryInput = screen.getByPlaceholderText('e.g. 50') as HTMLInputElement
    expect(salaryInput.value).toBe('$50.50')
  })

  test('handles null/empty values correctly', () => {
    const mockOnChange = jest.fn()
    const value = {
      annualRevenue: null,
      lostRevenuePerHour: null,
      targetRTO: null,
      targetRPO: null,
      dataFootprintTB: null,
      industry: 'other',
      hasVMs: false,
      vmCount: null,
      missionCriticalVmCount: null,
      requiresImmutability: false,
      requiresAirGap: false,
      hoursDowntime: null,
      pctRevenueImpacted: null,
      employees: null,
      avgHourlySalary: null,
    }

    render(<InputForm value={value} onChange={mockOnChange} />)

    const input = screen.getByPlaceholderText('e.g. 100000000') as HTMLInputElement
    expect(input.value).toBe('—')
  })
})
