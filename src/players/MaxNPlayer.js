﻿/** # MaxNPlayer

Automatic players based on the [MaxN](http://dl.acm.org/citation.cfm?id=2887795) algorithm, a 
MiniMax variant for games of more than two players.
*/
var MaxNPlayer = players.MaxNPlayer = declare(HeuristicPlayer, {
	/** Besides the parameters of every [`HeuristicPlayer`](HeuristicPlayer.js.html), an `horizon` 
	for the search may be specified (3 plies by default).
	*/
	constructor: function MaxNPlayer(params) {
		HeuristicPlayer.call(this, params);
		var prototype = Object.getPrototypeOf(this);
		initialize(this, params)
			.integer('horizon', { defaultValue: prototype.horizon, coerce: true });
	},

	horizon: 4,

	/** MaxN players cannot be used with simultaneous or non-deterministic games.
	*/
	isCompatibleWith: function isCompatibleWith(game) {
		return !game.isSimultaneous && game.isDeterministic;
	},
	
	/** This player evaluates each state using the `maxn` method, taking the evaluation for the 
	given `player`.
	*/
	stateEvaluation: function stateEvaluation(game, player) {
		if (!game.isContingent) {
			return this.maxN(game, player, 0)[player];
		} else {
			raise("MaxNPlayer.stateEvalution() does not support contingent game states!"); //TODO
		}
	},

	/** `heuristics(game)` returns an heuristic value for each players in the game, as an object.
	*/
	heuristics: function heuristics(game) {
		var result = {}, maxN = this;
		game.players.forEach(function (role) {
			result[role] = maxN.heuristic(game, role);
		});
		return result;
	},

	/** `quiescence(game, player, depth)` is a stability test for the given `game` state and the 
	given `player`. If the game is quiescent, this function must return evaluations. Else it must 
	return null. 
	
	Final game states are always quiescent, and their evaluations are the game's result for each 
	player. This default implementation also returns heuristic evaluations for every game state at 
	a deeper depth than the player's horizon, calculated via the `heuristics()` method. 
	*/
	quiescence: function quiescence(game, player, depth) {
		var results = game.result();
		if (results) {
			return results;
		} else if (depth >= this.horizon) {
			return this.heuristics(game);
		} else {
			return null;
		}
	},
	
	/** The core `maxN(game, player, depth)` algorithm return the evaluations for each player of the 
	given game, assuming each player tries to maximize its own evaluation regardless of the others'.
	*/
	maxN: function maxN(game, player, depth) {
		var values = this.quiescence(game, player, depth);
		if (!values) { // game is not quiescent.
			var activePlayer = game.activePlayer(),
				moves = this.movesFor(game, activePlayer),
				otherValues, next;
			values = {};
			if (moves.length < 1) {
				throw new Error('No moves for unfinished game '+ game +'.');
			}
			for (var i = 0; i < moves.length; ++i) {
				next = game.next(obj(activePlayer, moves[i]));
				otherValues = this.maxN(next, player, depth + 1);
				if (otherValues[activePlayer] > (values[activePlayer] || -Infinity)) {
					values = otherValues;
				}
			}
		}
		return values;
	},
	
	// ## Utilities ################################################################################
	
	/** Serialization and materialization using Sermat.
	*/
	'static __SERMAT__': {
		identifier: 'MaxNPlayer',
		serializer: function serialize_MaxNPlayer(obj) {
			var ser = HeuristicPlayer.__SERMAT__.serializer(obj),
				args = ser[0];
			args.horizon = obj.horizon;
			return ser;
		}
	}
}); // declare MaxNPlayer.