﻿define(['ludorum', 'creatartis-base', 'sermat'], function (ludorum, base, Sermat) {
	var RANDOM = base.Randomness.DEFAULT;	
	
	function itIsGameInstance(game) {
		it("is a valid instance of ludorum.Game", function () {
			expect(game).toBeOfType(ludorum.Game);
			expect(game.name).toBeTruthy();
			expect(game.players).toBeOfType(Array);
			expect(game.players.length).toBeGreaterThan(0);
			expect(Sermat.sermat(game)).toBeOfType(game.constructor);
		});
	}

	function checkFinishedGame(game, options) {
		expect(game.moves()).toBeFalsy();
		var sum = 0, result = game.result();
		expect(result).toBeTruthy();
		game.players.forEach(function (player) {
			expect(result[player]).toBeOfType('number');
			sum += result[player];
		});
		if (options && options.zeroSum) {
			expect(sum).toBe(0);
		}
	}
	
	function checkUnfinishedGame(game, options) {
		var moves = game.moves();
		expect(moves).toBeTruthy();
		expect(game.activePlayers).toBeOfType(Array);
		if (options && options.oneActivePlayerPerTurn) {
			expect(game.activePlayers.length).toBe(1);
		}
		if (game.activePlayers.length === 1) {
			expect(game.activePlayer()).toBe(game.activePlayers[0]);
		} else {
			expect(game.activePlayer.bind(game)).toThrow();
		}
		game.activePlayers.forEach(function (activePlayer) {
			expect(game.isActive(activePlayer)).toBe(true);
			expect(moves[activePlayer]).toBeOfType(Array);
			expect(moves[activePlayer].length).toBeGreaterThan(0);
		});
		if (options.deterministic) {
			var haps = { dice: RANDOM.randomInt(1, 7) };
			expect(game.next.bind(game, game.possibleMoves()[0], haps)).toThrow();
		}
	}
	
	function itWorksLikeGame(game, options) {
		it("works like a game", function () {
			var MAX_PLIES = 500, moves, decisions;
			for (var i = 0; i < MAX_PLIES; i++) {
				while (game && game.isContingent) {
					// Deterministic games should not use Contingent states.
					expect(!!options.deterministic).toBe(false);
					game = game.randomNext();
				}
				expect(game).toBeOfType(ludorum.Game);
				moves = game.moves();
				expect(Sermat.ser(game)).toEqual(Sermat.ser(game.clone()));
				if (!moves) {
					checkFinishedGame(game, options);
					break;
				} else {
					checkUnfinishedGame(game, options);
					decisions = {};
					game.activePlayers.forEach(function (activePlayer) {
						decisions[activePlayer] = RANDOM.choice(moves[activePlayer]);
					});
					game = game.next(decisions);
				}
			}
			if (i >= MAX_PLIES) {
				throw new Error("Match of game "+ game.name +" did not end after "+ 
					MAX_PLIES +" plies (final state: "+ game +")!");
			}
			//expect(i).toBeLessThan(MAX_PLIES);
		});
	}
	
	[{ game: "Predefined",     zeroSum: 1, oneActivePlayerPerTurn: 1, deterministic: 1 },
	 { game: "Choose2Win",     zeroSum: 1, oneActivePlayerPerTurn: 1, deterministic: 1 },
	 { game: "TicTacToe",      zeroSum: 1, oneActivePlayerPerTurn: 1, deterministic: 1 },
	 { game: "ToadsAndFrogs",  zeroSum: 1, oneActivePlayerPerTurn: 1, deterministic: 1 },
	 { game: "Pig",            zeroSum: 1, oneActivePlayerPerTurn: 1, deterministic: 0 },
	 { game: "ConnectionGame", zeroSum: 1, oneActivePlayerPerTurn: 1, deterministic: 1 },
	 { game: "Bahab",          zeroSum: 1, oneActivePlayerPerTurn: 1, deterministic: 1 },
	 { game: "OddsAndEvens",   zeroSum: 1, oneActivePlayerPerTurn: 0, deterministic: 1 },
	 { game: "Mutropas",       zeroSum: 1, oneActivePlayerPerTurn: 0, deterministic: 0 },
	 { game: "Puzzle15",       zeroSum: 0, oneActivePlayerPerTurn: 1, deterministic: 1 }
	].forEach(function (options) {
		describe("games."+ options.game, function () {
			var game = new ludorum.games[options.game]();
			itIsGameInstance(game, options);
			itWorksLikeGame(game, options);
		});
	});
	
//// Game specific tests. //////////////////////////////////////////////////////////////////////////

	describe("games.Predefined()", function () {
		it("works like a game", function () {
			var game, moves, results, resultA, resultB;
			for (var h = 0; h < 15; h++) {
				for (var w = 1; w < 10; w++) {
					resultA = (h % 3) - 1;
					resultB = -resultA;
					game = new ludorum.games.Predefined('A', {'A': resultA, 'B': resultB}, h, w);
					expect(game.players.join(' ')).toBe('A B');
					for (var i = 0; i < h; i++) {
						moves = game.moves();
						expect(moves).toBeTruthy();
						expect(game.result()).toBeFalsy();
						moves = moves[game.activePlayer()];
						expect(moves).toBeTruthy();
						expect(moves.length).toEqual(w);
						game = game.next(base.obj(game.activePlayer(), moves[i % w]));
					}
					expect(game.moves()).toBeFalsy();
					results = game.result();
					expect(results).toBeTruthy();
					expect(results.A).toEqual(resultA);
					expect(results.B).toEqual(resultB);
				}
			}
		});
	}); // games.Predefined()
	
	describe("games.Choose2Win()", function () { ///////////////////////////////////////////////////
		var game = new ludorum.games.Choose2Win();
		it("must enable to choose to win or lose", function () {
			expect(game.activePlayer()).toBe('This');
			var moves = game.moves().This;
			expect(moves.indexOf('win') >= 0).toBe(true);
			var result = game.next({ This: 'win' }).result();
			expect(result.This).toBeGreaterThan(0);
			expect(moves.indexOf('lose') >= 0).toBe(true);
			result = game.next({ This: 'lose' }).result();
			expect(result.This).toBeLessThan(0);
			expect(moves.indexOf('pass') >= 0).toBe(true);
			result = game.next({ This: 'pass' }).result();
			expect(result).toBeFalsy();
		});
	}); // games.Choose2Win()
	
}); //// define.
