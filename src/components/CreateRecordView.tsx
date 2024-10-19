import { Title } from "@solidjs/meta";
import { Component } from "solid-js";
import { Form } from "./Form";
import { schema } from "~/schema";
import { PageTitle } from "./PageTitle";
import { humanCase } from "~/util";

export const CreateRecordView: Component<{
  tableName: string;
}> = (props) => {
  const tableSchema = schema.tables[props.tableName]
  return (
    <main>
      <Title>{props.tableName}</Title>
      <PageTitle>
        New {humanCase(props.tableName)}
      </PageTitle>
      <Form tableName={props.tableName} />
    </main>
  )
}