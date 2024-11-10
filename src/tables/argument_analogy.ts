import { TableSchema } from "../schema/type";

export const argument_analogy: TableSchema = {
  extendsTable: 'argument',
  columns: {
    text: {
      type: 'text'
    }
  },
  initialData: [
    [1, 'Cheese and the Moon are both yellow and round. Cheese is made from cheese. Therefore the Moon is also made from cheese.']
  ]
}
