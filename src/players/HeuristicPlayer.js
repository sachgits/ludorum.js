﻿/** ## Class HeuristicPlayer

This is the base type of automatic players based on heuristic evaluations of 
game states or moves.
*/
var HeuristicPlayer = players.HeuristicPlayer = declare(Player, {
	/** The constructor takes the player's `name` and a `random` number 
	generator (`base.Randomness.DEFAULT` by default). Many heuristic can be 
	based on randomness, but this is also necessary to chose between moves with
	the same evaluation without any bias.
	*/
	constructor: function HeuristicPlayer(params) {
		Player.call(this, params);
		initialize(this, params)
			.object('random', { defaultValue: Randomness.DEFAULT })
			.func('heuristic', { ignore: true });
	},

	/** An `HeuristicPlayer` choses the best moves at any given game state. For
	this purpose it evaluates every move with 
	`moveEvaluation(move, game, player)`. By default this function evaluates
	the states resulting from making each move, which is the most common thing
	to do.
	*/
	moveEvaluation: function moveEvaluation(move, game, player) {
		return this.stateEvaluation(game.next(obj(player, move)), player);
	},

	/** The `stateEvaluation(game, player)` calculates a number as the 
	assessment of the given game state for the given player. The base 
	implementation returns the result for the player is the game has results, 
	else it returns the heuristic value for the state.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		var gameResult = game.result();
		return gameResult ? gameResult[player] : this.heuristic(game, player);
	},

	/** The `heuristic(game, player)` is an evaluation used at states that are 
	not finished games. The default implementation returns a random number in 
	[-0.5, 0.5). This is only useful in testing. Any serious use should redefine 
	this.
	*/
	heuristic: function heuristic(game, player) {
		return this.random.random(-0.5, 0.5);
	},
	
	/** The `bestMoves(evaluatedMoves)` are all the best evaluated in the given
	sequence of tuples [move, evaluation].
	*/
	bestMoves: function bestMoves(evaluatedMoves) {
		return iterable(evaluatedMoves).greater(function (pair) {
			return pair[1];
		}).map(function (pair) {
			return pair[0];
		});
	},
	
	/** `selectMoves(moves, game, player)` return an array with the best 
	evaluated moves. The evaluation is done with the `moveEvaluation` method. 
	The default implementation always returns a `Future`.
	*/
	selectMoves: function selectMoves(moves, game, player) {
		var heuristicPlayer = this,
			asyncEvaluations = false,
			evaluatedMoves = moves.map(function (move) {
				var e = heuristicPlayer.moveEvaluation(move, game, player);
				if (e instanceof Future) {
					asyncEvaluations = asyncEvaluations || true;
					return e.then(function (e) {
						return [move, e];
					});
				} else {
					return [move, e];
				}
			});
		if (asyncEvaluations) { // Avoid using Future if possible.
			return Future.all(evaluatedMoves).then(this.bestMoves);
		} else {
			return this.bestMoves(evaluatedMoves);
		}
	},
	
	/** The `decision(game, player)` selects randomly from the best evaluated 
	moves.
	*/
	decision: function decision(game, player) {
		var heuristicPlayer = this,
			selectedMoves = heuristicPlayer.selectMoves(heuristicPlayer.__moves__(game, player), game, player);
		return Future.then(selectedMoves, function (selectedMoves) {
			return heuristicPlayer.random.choice(selectedMoves);
		});
	}
}); // declare HeuristicPlayer.
