import { z } from 'zod';
import { MemberProfileTextRecord } from '@/domain/member-profile/MemberProfileTextRecord';

const TextRecordRowSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const ResolverSchema = z.object({
  texts: z.array(TextRecordRowSchema),
});

/**
 * Shape of the `FindMemberProfileTextRecords` GraphQL response.
 */
const FindMemberProfileTextRecordsResponseSchema = z.object({
  Domain: z
    .array(
      z.object({
        resolver: ResolverSchema.nullable(),
      }),
    )
    .max(1),
});

export type TextRecordRowDTO = z.infer<typeof TextRecordRowSchema>;
export type FindMemberProfileTextRecordsResponse = z.infer<
  typeof FindMemberProfileTextRecordsResponseSchema
>;

export function mapDTOToDomain(raw: unknown): MemberProfileTextRecord[] {
  const parsed = FindMemberProfileTextRecordsResponseSchema.parse(raw);
  const domain = parsed.Domain[0];
  if (!domain?.resolver) {
    return [];
  }

  return domain.resolver.texts.map((text) =>
    MemberProfileTextRecord.create({
      key: text.key,
      value: text.value,
    }),
  );
}
