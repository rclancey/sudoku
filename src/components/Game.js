import React, {
  useCallback,
  useState,
} from 'react';
import game, { getRandomBoard } from '../lib/boards';
import GameBoard from './GameBoard';

const togglePad = (pad, v) => {
  if (pad.includes(v)) {
    return pad.filter((x) => x !== v);
  }
  return pad.concat([v]).sort();
};

const loadGame = (game) => {
  const data = window.localStorage.getItem('state');
  if (data === null || data === undefined || data === '') {
    return;
  }
  const state = JSON.parse(data);
  game.init = state.init;
  game.data = state.data;
  game.stack = state.stack;
  game.recalculate();
};

const saveGame = (game) => {
  const state = {
    init: game.init,
    data: game.data,
    stack: game.stack,
  };
  window.localStorage.setItem('state', JSON.stringify(state));
};

loadGame(game);

export const Game = () => {
  const [gameId, setGameId] = useState(game.init.join(''));
  const [level, setLevel] = useState('hard');
  const [showHints, setShowHints] = useState(false);
  const [grid, setGrid] = useState(game.grid());
  const [error, setError] = useState(null);
  const onNewGame = useCallback(() => {
    if (level === 'random') {
      game.generate();
    } else {
      const board = getRandomBoard(level);
      game.reset(board);
    }
    saveGame(game);
    setGameId(game.init.join(''));
    setGrid(game.grid());
  }, [level]);
  const onChangeLevel = useCallback((evt) => setLevel(evt.target.value), []);
  const onToggleHints = useCallback(() => setShowHints(orig => !orig), []);
  const onChange = (evt, i, j) => {
    const { code, shiftKey } = evt;
    //console.debug({ ...evt });
    if (shiftKey) {
      let pad = game.pad[i * 9 + j];
      if (pad === null) {
        pad = game.possible[i * 9 + j].slice(0);
      }
      switch (code) {
        case 'Digit1':
          pad = togglePad(pad, 1);
          break;
        case 'Digit2':
          pad = togglePad(pad, 2);
          break;
        case 'Digit3':
          pad = togglePad(pad, 3);
          break;
        case 'Digit4':
          pad = togglePad(pad, 4);
          break;
        case 'Digit5':
          pad = togglePad(pad, 5);
          break;
        case 'Digit6':
          pad = togglePad(pad, 6);
          break;
        case 'Digit7':
          pad = togglePad(pad, 7);
          break;
        case 'Digit8':
          pad = togglePad(pad, 8);
          break;
        case 'Digit9':
          pad = togglePad(pad, 9);
          break;
        case 'Digit0':
        case 'Backspace':
        case 'Space':
          pad = null;
          break;
        default:
          return;
      }
      game.pad[i * 9 + j] = pad;
    } else {
      switch (code) {
        case 'Digit1':
          game.setSquare(i, j, 1);
          break;
        case 'Digit2':
          game.setSquare(i, j, 2);
          break;
        case 'Digit3':
          game.setSquare(i, j, 3);
          break;
        case 'Digit4':
          game.setSquare(i, j, 4);
          break;
        case 'Digit5':
          game.setSquare(i, j, 5);
          break;
        case 'Digit6':
          game.setSquare(i, j, 6);
          break;
        case 'Digit7':
          game.setSquare(i, j, 7);
          break;
        case 'Digit8':
          game.setSquare(i, j, 8);
          break;
        case 'Digit9':
          game.setSquare(i, j, 9);
          break;
        case 'Digit0':
        case 'Backspace':
        case 'Space':
          game.setSquare(i, j, 0);
          break;
        default:
          return;
      }
    }
    saveGame(game);
    setGrid(game.grid());
    setError(null);
  };
  const undo = useCallback(() => {
    game.pop();
    saveGame(game);
    setGrid(game.grid());
    setError(null);
  }, []);
  const solve = useCallback(() => {
    game.push();
    if (game.solve()) {
      saveGame(game);
      setGrid(game.grid());
      //setTimeout(solve, 500);
    }
  }, []);
  const fullSolve = useCallback(() => {
    game.push();
    const start = performance.now();
    const resp = game.fullSolve(game.data.slice(0));
    const end = performance.now();
    console.debug('full solve took %o ms', end - start);
    if (resp === null) {
      game.pop();
      setError("can't solve");
    } else {
      game.data = resp.slice(0);
      game.recalculate();
      saveGame(game);
      setGrid(game.grid());
    }
  }, []);
  const reset = useCallback(() => {
    game.push();
    game.reset();
    saveGame(game);
    setGrid(game.grid());
    setError(null);
  }, []);
  return (
    <div className={`game ${showHints ? 'hints' : ''}`}>
      <select value={level} onChange={onChangeLevel}>
        <option value="easy">Easy</option>
        <option value="hard">Hard</option>
        <option value="evil">Evil</option>
        <option value="random">Random</option>
      </select>
      <input type="button" value="New Game" onClick={onNewGame} />
      <br />
      <GameBoard id={gameId} grid={grid} hints={showHints} onChange={onChange} />
      <br />
      <input type="button" value="Undo" onClick={undo} />
      <input type="button" value={showHints ? 'Hide Hints' : 'Show Hints'} onClick={onToggleHints} />
      <input type="button" value="Solve" onClick={solve} />
      <input type="button" value="Full Solution" onClick={fullSolve} />
      <input type="button" value="Start Over" onClick={reset} />
      { error ? <p>{error}</p> : null }
    </div>
  );
}

export default Game;
