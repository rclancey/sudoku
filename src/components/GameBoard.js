import React, { useCallback } from 'react';

const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const Hint = ({ data }) => {
  const set = new Set(data);
  return (
    <div className="grid">
      { nums.map((v) => (
        <div key={v}>{set.has(v) ? v : ''}</div>
      )) }
    </div>
  );
};

const GameCell = ({ id, row, column, data, onChange }) => {
  let type;
  let children;
  if (data.type === 'hint') {
    children = (<Hint id={id} row={row} column={column} data={data.value} />);
  } else if (data.type === 'pad') {
    children = (<Hint id={id} row={row} column={column} data={data.value} />);
  } else {
    children = `${data.value}`;
  }
  const onKeyDown = useCallback((evt) => onChange(evt, row, column), [row, column, onChange]);
  return (
    <td
      className={`col${column % 3} ${data.type}`}
      tabIndex={row * 9 + column}
      onKeyDown={onKeyDown}
    >
      { children }
    </td>
  );
};

const GameRow = ({ id, row, data, onChange }) => (
  <tr className={`row${row % 3}`}>
    { data.map((val, column) => (
      <GameCell key={column} id={id} row={row} column={column} data={val} onChange={onChange} />
    )) }
  </tr>
);

export const GameBoard = ({ id, grid, onChange }) => (
  <table>
    <tbody>
      { grid.map((data, row) => (
        <GameRow key={row} id={id} row={row} data={data} onChange={onChange} />
      )) }
    </tbody>
  </table>
);

export default GameBoard;
