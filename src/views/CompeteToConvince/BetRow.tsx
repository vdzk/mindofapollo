import { Component, For, Show } from "solid-js";
import { Button } from "~/components/buttons";
import { Link } from "~/components/Link";
import { tableStyle } from "~/components/table";
import { DataRecordWithId } from "~/schema/type";
import { getPercent } from "~/utils/string";
import { BetStatus } from "./Bets";

export const BetRow: Component<{
  bet: DataRecordWithId;
  authenticated: boolean;
  userId?: number;
  onOppose: (betId: number) => void;
  onDelete: (betId: number) => void;
  status: BetStatus
}> = props => {
  const ownBet = () => props.userId === props.bet.creator_id;
  const position = () => {
    const { extTableName, threshold_value, creator_above } = props.bet;
    let threshold;
    if (extTableName === 'bet_confidence') {
      threshold = getPercent(threshold_value as number);
    } else {
      threshold = threshold_value;
    }
    const compOp = creator_above ? '>' : '<'
    return `${compOp}${threshold}`
  };
  const actionBtn = () => {
    if (props.bet.taker_id) {
      return null;
    } else {
      if (ownBet()) {
        return (
          <Button
            label="Delete"
            onClick={() => props.onDelete(props.bet.id)} />
        );
      } else {
        return (
          <Button
            label="Oppose"
            tooltip="Take the other side of the bet"
            onClick={() => confirm(`Take the opposite side of the bet and risk ${props.bet.stake} of your competition credits?`) && props.onOppose(props.bet.id)} />
        )
      }
    }
  }
  return (
    <tr>
      <For each={[
        <>
          <Link
            route="show-record"
            params={{
              tableName: 'statement',
              id: props.bet.statement_id
            }}
            label={props.bet.statement_label}
          />
          <Show when={props.bet.moral_weight_profile_id}>
            <span
              title="Different people value things differently. A moral profile determines how outcomes of a prescription are evaluated."
              class="inline-block px-2 cursor-default"
            >
                ⚖️
            </span>
            <Link
              route="show-record"
              params={{
                tableName: 'moral_weight_profile',
                id: props.bet.moral_weight_profile_id
              }}
              label={props.bet.moral_weight_profile_name}
            />
          </Show>
        </>,
        position(),
        `${props.bet.duration_days} d`,
        `${props.bet.stake} CC`,
        <Link
          route="show-record"
          params={{
            tableName: 'person',
            id: props.bet.creator_id,
            "person-section": 'activity'
          }}
          label={props.bet.creator_name}
        />,
        ...(props.status === 'matched' ? [
          <Link
            route="show-record"
            params={{
              tableName: 'person',
              id: props.bet.taker_id,
              "person-section": 'activity'
            }}
            label={props.bet.taker_name}
          />,
          props.bet.start_date ?? ''
        ] : []),
        ...(props.authenticated && props.status === 'open' ? [
          actionBtn()
        ] : [])
      ]}>
        {(content, index) => (
          <td class={tableStyle.tdMiddle + ' align-middle' + (index() === 0 ? ' pl-2' : '')}>
            {content}
          </td>
        )}
      </For>
    </tr>
  );
};
