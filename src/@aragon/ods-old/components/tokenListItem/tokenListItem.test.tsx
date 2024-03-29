import {render, screen} from '@testing-library/react';
import React from 'react';
import {TokenListItem} from './tokenListItem';

describe('TokenListITem', () => {
  // eslint-disable-next-line
    function setup(args?: any) {
    render(<TokenListItem {...args} />);
    return screen.getByTestId('tokenListItem');
  }

  test('should render without crashing', () => {
    const element = setup();
    expect(element).toBeVisible;
  });
});
