import React, {useState} from 'react';
import styled from 'styled-components';

import {AlertInline} from '../alerts';
import {ButtonText} from '../button';
import {SearchInput} from '../input';
import {LinearProgress} from '../progress';
import {ButtonGroup, Option} from '../button';
import {VotersTable, VoterType} from '../table';
import {CheckboxListItem} from '../checkbox';

// TODO: Every string and data needed by the component is hardcoded for now.

const voters: Array<VoterType> = [
  {
    wallet: 'DAO XYZ',
    option: 'Yes',
    votingPower: '40%',
    tokenAmount: '1,000TN',
  },
  {
    wallet: 'punk5768.eth',
    option: 'No',
    votingPower: '10%',
    tokenAmount: '200',
  },
  {
    wallet: '0xc54c...ee7a',
    option: 'Yes',
    votingPower: '13.333%',
    tokenAmount: '250TN',
  },
];

export const VotingTerminal: React.FC = () => {
  const [buttonGroupState, setButtonGroupState] = useState('info');
  const [votingInProcess, setVotingInProcess] = useState(false);

  return (
    <Container>
      <Header>
        <Heading1>Voting</Heading1>
        <ButtonGroup
          bgWhite
          defaultValue={buttonGroupState}
          onChange={setButtonGroupState}
        >
          <Option value="breakdown" label="Breakdown" />
          <Option value="voters" label="Voters" />
          <Option value="info" label="Info" />
        </ButtonGroup>
      </Header>

      {buttonGroupState === 'breakdown' ? (
        <VStackRelaxed>
          <VStackNormal>
            <HStack>
              <p className="font-bold text-primary-500">Yes</p>
              <p className="flex-1 text-right text-ui-600">X Token</p>
              <p className="pl-6 font-bold text-primary-500">0%</p>
            </HStack>
            <LinearProgress max={100} value={1} />
          </VStackNormal>

          <VStackNormal>
            <HStack>
              <p className="font-bold text-primary-500">No</p>
              <p className="flex-1 text-right text-ui-600">X Token</p>
              <p className="pl-6 font-bold text-primary-500">0%</p>
            </HStack>
            <LinearProgress max={100} value={1} />
          </VStackNormal>
        </VStackRelaxed>
      ) : buttonGroupState === 'voters' ? (
        <div className="space-y-2">
          <SearchInput placeholder="Type Address, ENS or E-Mail" />
          <VotersTable
            voters={voters}
            onLoadMore={() => console.log('load more clicked')}
          />
        </div>
      ) : (
        <VStackRelaxed>
          <VStackNormal>
            <InfoLine>
              <p>Options</p>
              <Strong>Yes + No</Strong>
            </InfoLine>
            <InfoLine>
              <p>Strategy</p>
              <Strong>{'1 Token -> 1 Vote'}</Strong>
            </InfoLine>
            <InfoLine>
              <p>Minimum Approval</p>
              <Strong>420k DNT (15%)</Strong>
            </InfoLine>
            <InfoLine>
              <p>Participation</p>
              <Strong>0 of 3.5M DNT (0%)</Strong>
            </InfoLine>
            <InfoLine>
              <p>Unique Voters</p>
              <Strong>0</Strong>
            </InfoLine>
          </VStackNormal>

          <VStackNormal>
            <Strong>Duration</Strong>
            <InfoLine>
              <p>Start</p>
              <Strong>2021/11/17 00:00 AM UTC+2</Strong>
            </InfoLine>
            <InfoLine>
              <p>End</p>
              <Strong>2021/16/17 00:00 AM UTC+2</Strong>
            </InfoLine>
          </VStackNormal>
        </VStackRelaxed>
      )}

      {votingInProcess ? (
        <VotingContainer>
          <Heading2>Choose your option</Heading2>
          <p className="mt-1 text-ui-500">
            To vote, you must select one of the following options. Afterwards, a
            confirmation with your wallet is necessary. Once the transaction is
            completed, your vote will be counted and displayed.
          </p>

          <CheckboxContainer>
            <CheckboxListItem
              label="No"
              helptext="Your choice will be counted for option no"
            />
            <CheckboxListItem
              label="Yes"
              helptext="Your choice will be counted for option yes"
            />
          </CheckboxContainer>

          <VoteContainer>
            <ButtonWrapper>
              <ButtonText label="Submit your vote" size="large" />
              <ButtonText
                label="Cancel"
                mode="ghost"
                size="large"
                onClick={() => setVotingInProcess(false)}
              />
            </ButtonWrapper>
            <AlertInline label="Remaining time" mode="neutral" />
          </VoteContainer>
        </VotingContainer>
      ) : (
        <VoteContainer>
          <ButtonText
            label="Vote now"
            size="large"
            onClick={() => setVotingInProcess(true)}
          />
          <AlertInline label="Remaining time" mode="neutral" />
        </VoteContainer>
      )}
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'tablet:p-3 py-2.5 px-2 rounded-xl bg-ui-0',
})``;

const Header = styled.div.attrs({
  className:
    'tablet:flex tablet:justify-between tablet:items-center mb-4 tablet:mb-5 space-y-2 tablet:space-y-0',
})``;

const Heading1 = styled.h1.attrs({
  className: 'text-2xl font-bold text-ui-800 flex-grow',
})``;

const VStackRelaxed = styled.div.attrs({
  className: 'space-y-3',
})``;

const VStackNormal = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const HStack = styled.div.attrs({
  className: 'flex space-x-1.5',
})``;

const InfoLine = styled.div.attrs({
  className: 'flex justify-between text-ui-600',
})``;

const Strong = styled.p.attrs({
  className: 'font-bold text-ui-800',
})``;

const VotingContainer = styled.div.attrs({
  className: 'mt-6 tablet:mt-5',
})``;

const Heading2 = styled.h2.attrs({
  className: 'text-xl font-bold text-ui-800',
})``;

const CheckboxContainer = styled.div.attrs({
  className: 'tablet:flex mt-3 space-y-1.5 tablet:space-y-0 tablet:space-x-3',
})``;

const VoteContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row tablet:justify-between items-center tablet:items-center mt-3 space-y-2 tablet:space-y-0',
})`
  button {
    @media (max-width: 767px) {
      width: 100%;
    }
  }
`;

const ButtonWrapper = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-2 space-x-0 tablet:space-y-0 tablet:space-x-2 w-full tablet:w-max',
})``;
