import React, {ReactNode} from 'react';
import styled from 'styled-components';
import {Badge} from '../badge';
import {LinearProgress} from '../progress';
import {AlertInline} from '../alerts';
import {Address, shortenAddress} from '../../utils/addresses';
import {Link} from '../link';
import {AvatarDao} from '../avatar';
import {IconClock} from '../icons';

export type CardProposalProps = {
  /** Proposal Title / Title of the card */
  title: string;
  /** Proposal Description / Description of the card */
  description: string;
  /**
   * Will be called when the button is clicked.
   * */
  onClick: () => void;
  /**
   * Available states that proposal card have. by changing the status,
   * the headers & buttons wil change to proper format also the progress
   * section only available on active state.
   * */
  state: 'draft' | 'pending' | 'active' | 'succeeded' | 'executed' | 'defeated';
  /** Indicates whether the proposal is in being used in list or in its special form (see explore page) */
  type?: 'list' | 'explore';
  /** Url for the dao avatar */
  daoLogo?: 'string';
  /** The title that appears at the top of the progress bar */
  voteTitle: string;
  /** Progress bar value in percentage (max: 100) */
  voteProgress?: number | string;
  /** Vote label that appears at bottom of the progress bar */
  voteLabel?: string;
  /** Proposal token amount */
  tokenAmount?: string;
  /** Proposal token symbol */
  tokenSymbol?: string;
  /** Publish by sentence in any available languages */
  publishLabel: string;
  /** Publisher's ethereum address, ENS name **or** DAO address when type is explore */
  publisherAddress?: Address;
  /** DAO name to display when type is explore */
  daoName?: string;
  /** Chain ID for redirect user to the right explorer */
  chainId?: number;
  /**
   * Button label for different status
   * ['pending / executed / defeated label', 'active label', 'succeeded label', 'draft label']
   * TODO: I thought to add 4 button Label
   * props for different states and implement
   * condition here but i decided to use only one prop
   * for reducing the complexity
   */
  buttonLabel: string[];
  AlertMessage?: string;
  /**
   * ['Draft', 'Pending', 'Active', 'Executed', 'Succeeded', 'Defeated']
   */
  StateLabel: string[];
};

export const explorers: {
  [key: number]: string;
} = {
  1: 'https://etherscan.io/address/',
  4: 'https://rinkeby.etherscan.io/address/',
  42161: 'https://arbiscan.io/address/',
};

export const CardProposal: React.FC<CardProposalProps> = ({
  state = 'pending',
  title,
  description,
  voteTitle,
  voteProgress,
  voteLabel,
  tokenAmount,
  tokenSymbol,
  publishLabel,
  publisherAddress,
  chainId = 1,
  AlertMessage,
  StateLabel,
  type = 'list',
  daoLogo,
  daoName,
  onClick,
}: CardProposalProps) => {
  const isTypeExplore = type === 'explore';

  const headerOptions: {
    [key in CardProposalProps['state']]: ReactNode;
  } = {
    draft: <Badge label={StateLabel[0]} />,
    pending: (
      <>
        <Badge label={StateLabel[1]} />
        {AlertMessage && (
          <AlertInline
            label={AlertMessage}
            icon={<IconClock className="text-info-500" />}
            mode="neutral"
          />
        )}
      </>
    ),
    active: (
      <>
        {!isTypeExplore && <Badge label={StateLabel[2]} colorScheme={'info'} />}
        {AlertMessage && (
          <AlertInline
            label={AlertMessage}
            icon={<IconClock className="text-info-500" />}
            mode="neutral"
          />
        )}
      </>
    ),
    executed: <Badge label={StateLabel[3]} colorScheme={'success'} />,
    succeeded: <Badge label={StateLabel[4]} colorScheme={'success'} />,
    defeated: <Badge label={StateLabel[5]} colorScheme={'critical'} />,
  };

  return (
    <Card data-testid="cardProposal" onClick={onClick}>
      <Header>{headerOptions[state]}</Header>
      <TextContent>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <Publisher>
          {isTypeExplore ? (
            <AvatarDao daoName={daoName!} size="small" src={daoLogo} />
          ) : (
            <PublisherLabel>{publishLabel}</PublisherLabel>
          )}

          <Link
            external
            href={`${explorers[chainId]}${publisherAddress}`}
            label={shortenAddress(
              (isTypeExplore ? daoName : publisherAddress) || ''
            )}
            className="text-sm"
          />
        </Publisher>
      </TextContent>
      {state === 'active' && (
        <LoadingContent>
          <ProgressInfoWrapper>
            <ProgressTitle>{voteTitle}</ProgressTitle>
            <TokenAmount>
              {tokenAmount} {tokenSymbol}
            </TokenAmount>
          </ProgressInfoWrapper>
          <LinearProgress max={100} value={voteProgress} />
          <ProgressInfoWrapper>
            <Vote>{voteLabel}</Vote>
            <Percentage>{voteProgress}%</Percentage>
          </ProgressInfoWrapper>
        </LoadingContent>
      )}
    </Card>
  );
};

const Card = styled.button.attrs({
  className:
    'w-full bg-white rounded-xl p-2 space-y-3 ' +
    'active:border active:border-ui-200' +
    'hover:border hover:border-ui-100 ' +
    'focus:outline-none focus:ring-2 focus:ring-primary-500',
})`
  &:hover {
    box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
      0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
  }
`;

const Header = styled.div.attrs({
  className: 'flex justify-between',
})``;

const Title = styled.p.attrs({
  className: 'text-ui-800 text-left font-bold text-xl',
})``;

const Description = styled.p.attrs({
  className: 'text-ui-600 text-left font-normal text-base',
})``;

const Publisher = styled.span.attrs({
  className: 'flex space-x-1 text-ui-500 text-sm',
})``;

const TextContent = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const LoadingContent = styled.div.attrs({
  className: 'space-y-2 p-2 bg-ui-50 rounded-xl',
})``;

const ProgressInfoWrapper = styled.div.attrs({
  className: 'flex justify-between',
})``;

const ProgressTitle = styled.h3.attrs({
  className: 'text-ui-800 text-base font-bold',
})``;

const TokenAmount = styled.span.attrs({
  className: 'text-ui-500 text-sm',
})``;

const Vote = styled.span.attrs({
  className: 'text-primary-500 font-bold text-base',
})``;

const Percentage = styled.span.attrs({
  className: 'text-primary-500 font-bold text-base',
})``;

const PublisherLabel = styled.p.attrs({className: '-mr-0.5'})``;
