import { ValueObject } from 'ddd-core-ts';
import { z } from 'zod';

const PageRequestPropsSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(250),
});

type PageRequestProps = z.output<typeof PageRequestPropsSchema>;
type PageRequestInput = z.input<typeof PageRequestPropsSchema>;

export class PageRequest extends ValueObject<PageRequestProps> {
  get page(): number {
    return this.props.page;
  }

  get pageSize(): number {
    return this.props.pageSize;
  }

  get offset(): number {
    return (this.props.page - 1) * this.props.pageSize;
  }

  static create(props: PageRequestInput): PageRequest {
    const validated = PageRequestPropsSchema.parse(props);
    return new PageRequest(validated);
  }
}
