export default function createGame() {
  const state = {
    players: {},
    fruits: {},
    screen: {
      width: 20,
      height: 20,
    },
  };

  function setState(newState) {
    Object.assign(state, newState);
  }

  function start() {
    const frequency = 2000;

    setInterval(addFruit, frequency);
  }

  function movePlayer(command) {
    notifyAll(command);
    const acceptedMover = {
      ArrowUp(player) {
        player.y === 0 ? player.y : (player.y -= 1);
      },
      ArrowDown(player) {
        player.y === state.screen.height - 1 ? player.y : (player.y += 1);
      },
      ArrowLeft(player) {
        player.x === 0 ? player.x : (player.x -= 1);
      },
      ArrowRight(player) {
        player.x === state.screen.width - 1 ? player.x : (player.x += 1);
      },
    };

    const keyPressed = command.keyPressed;
    const player = state.players[command.playerId];
    const playerId = command.playerId;
    const moveFunction = acceptedMover[keyPressed];

    if (moveFunction && player) {
      moveFunction(player);
      collisionPlayerFruit({ playerId });
    }
  }

  function removePlayer(command) {
    delete state.players[command.playerId];
    notifyAll({
      type: "remove-player",
      playerId: command.playerId,
    });
  }

  function removeFruit(command) {
    delete state.fruits[command.fruitId];
    notifyAll({
      type: "remove-fruit",
      fruitId: command.fruitId,
    });
  }

  function collisionPlayerFruit(command) {
    const player = state.players[command.playerId];
    for (const fruitId in state.fruits) {
      const fruit = state.fruits[fruitId];
      if (player.x === fruit.x && player.y === fruit.y) {
        removeFruit({ fruitId });
      }
    }
  }

  function addPlayer(command) {
    const playerId = command.playerId;
    const x =
      "x" in command
        ? command.x
        : Math.floor(Math.random() * state.screen.width);
    const y =
      "y" in command
        ? command.y
        : Math.floor(Math.random() * state.screen.height);

    state.players[playerId] = {
      x,
      y,
    };

    notifyAll({
      type: "add-player",
      playerId,
      x,
      y,
    });
  }

  function addFruit(command) {
    const fruitId = command
      ? command.fruitId
      : Math.floor(Math.random() * 100000000);
    const x = command
      ? command.x
      : Math.floor(Math.random() * state.screen.width);
    const y = command
      ? command.y
      : Math.floor(Math.random() * state.screen.height);

    state.fruits[fruitId] = {
      x,
      y,
    };

    notifyAll({
      type: "add-fruit",
      fruitId,
      x,
      y,
    });
  }

  const observers = [];

  function subscribe(observerFunction) {
    observers.push(observerFunction);
  }

  function notifyAll(command) {
    for (const observerFunction of observers) {
      observerFunction(command);
    }
  }

  return {
    subscribe,
    addPlayer,
    removePlayer,
    addFruit,
    removeFruit,
    movePlayer,
    collisionPlayerFruit,
    state,
    setState,
    start,
  };
}
