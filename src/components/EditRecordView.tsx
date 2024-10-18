import { Title } from "@solidjs/meta";
import postgres from "postgres";
import { Component } from "solid-js";
import { schema } from "~/schema";
import { Form } from "./Form";


export const EditRecordView: Component<{
  id: string;
  tableName: string;
  record?: postgres.Row;
}> = (props) => {
  const columns = () => schema.tables[props.tableName].columns
  const columnEntries = () => Object.entries(columns())
  const titleColumnName = () => columnEntries()[0][0]


  return (
    <main>
      <Title>{props.record?.[titleColumnName()]}</Title>
      <Form id={props.id} tableName={props.tableName} record={props.record} />
    </main>
  );
}