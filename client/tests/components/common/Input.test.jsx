import React from 'react';
import { render, screen } from '@testing-library/react';
import Input from '../../../src/components/common/Input.jsx';

describe('Input', () => {
  test('renders label and error', () => {
    render(<Input id="x" label="Name" error="Required" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});

