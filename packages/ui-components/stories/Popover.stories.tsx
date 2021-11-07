import React from 'react';
import {Meta, Story} from '@storybook/react';
import {Button, Popover, PopoverProps} from '../src';

export default {
  title: 'Utils/Popover',
  component: Popover,
  argTypes: {
    backgroundColor: {control: 'color'},
  },
} as Meta;

const Template: Story<PopoverProps> = args => (
  <Popover {...args}>{args.children}</Popover>
);

export const Default = Template.bind({});
Default.args = {
  children: <Button label="button" primary />,
  content: (
    <div>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,
      molestiae quas vel sint commodi repudiandae consequuntur voluptatum
      laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga
      praesentium optio, eaque rerum! Provident similique accusantium nemo
      autem. Veritatis obcaecati tenetur iure eius earum ut molestias architecto
      voluptate aliquam nihil, eveniet aliquid culpa officia aut! Impedit sit
      sunt quaerat, odit, tenetur error, harum nesciunt ipsum debitis quas
      aliquid. Reprehenderit, quia. Quo neque error repudiandae fuga?
    </div>
  ),
};
