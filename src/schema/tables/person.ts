import { IoPersonSharp } from "solid-icons/io";
import { TableSchema } from "../type";

export const person: TableSchema = {
  plural: 'persons',
  icon: IoPersonSharp,
  columns: {
    name: {
      type: 'varchar'
    },
    email: {
      type: 'varchar'
    },
    password: {
      type: 'varchar'
    },
  },
  initialData: [
    /*1*/['Initialiser', '', ''],
    /*2*/['Alice', '', ''],
    /*3*/['Bob', '', '']
  ]
}