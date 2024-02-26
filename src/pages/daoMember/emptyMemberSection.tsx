import {
  Button,
  IIllustrationObjectProps,
  IllustrationObject,
} from '@aragon/ods';
import React from 'react';
import {useHref} from 'react-router-dom';

export interface IEmptyMemberSectionProps {
  title: string;
  illustration: IIllustrationObjectProps['object'];
  link?: {label: string; href: string};
}

export const EmptyMemberSection: React.FC<IEmptyMemberSectionProps> = props => {
  const {title, illustration, link} = props;

  const processedLink = useHref(link?.href || '');

  return (
    <div className="flex flex-row items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-0 px-6 py-5">
      <div className="flex grow flex-col items-start gap-4">
        <p className="text-base font-semibold leading-tight md:text-lg">
          {title}
        </p>
        {link && (
          <Button
            variant="tertiary"
            size="sm"
            href={processedLink}
            className="md:hidden"
          >
            {link.label}
          </Button>
        )}
      </div>
      <div className="rounded-full bg-neutral-50 p-2">
        <IllustrationObject
          object={illustration}
          className="h-16 w-16 md:h-20 md:w-20"
        />
      </div>
    </div>
  );
};
