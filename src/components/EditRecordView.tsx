import { Title } from "@solidjs/meta";
import postgres from "postgres";
import { Component } from "solid-js";
import { Form } from "./Form";
import { humanCase, titleColumnName } from "~/util";
import { PageTitle } from "./PageTitle";


export const EditRecordView: Component<{
  id: string;
  tableName: string;
  record?: postgres.Row;
}> = (props) => {
  return (
    <main>
      <Title>{props.record?.[titleColumnName(props.tableName)]}</Title>
      <PageTitle>
        Edit {humanCase(props.tableName)}
      </PageTitle>
      <Form id={props.id} tableName={props.tableName} record={props.record} />
    </main>
  );
}