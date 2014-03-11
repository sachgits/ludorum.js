﻿# ludorum.js

Ludorum is a board game framework. It is not focused on graphics or user interfaces, but on artificial players design, implementation and testing. Among other thing, it currently includes:
* Players based on [MiniMax](http://en.wikipedia.org/wiki/Minimax#Minimax_algorithm_with_alternate_moves) with [alfa-beta pruning](http://en.wikipedia.org/wiki/Alpha-beta_pruning), Max-N and pure [Monte Carlo tree search](http://en.wikipedia.org/wiki/Monte-Carlo_tree_search).
* Simple reference games, like: [TicTacToe](http://en.wikipedia.org/wiki/Tic-tac-toe), [ToadsAndFrogs](http://en.wikipedia.org/wiki/Toads_and_Frogs_%28game%29), [Mancala](http://en.wikipedia.org/wiki/Kalah) and [ConnectFour](http://en.wikipedia.org/wiki/Connect_four).

It supports loading with AMD (with [RequireJS](http://requirejs.org/)) or a script tag (sets 'ludorum' in the global namespace). In order to work requires another library of mine called [basis](https://github.com/LeonardoVal/basis.js). 

## License

Open source under an MIT license. See [LICENSE](LICENSE.md).

## Development

Development requires [NodeJS](http://nodejs.org/) (ver >= 0.10). Download the repository and run `npm install` to install: [RequireJS](http://requirejs.org/), [Grunt](http://gruntjs.com/) and some of its plugins. For testing I also use [jsconsole](http://jsconsole.com/).

## Contact

This software is being continually developed. Suggestions and comments are always welcome via [email](mailto:leonardo.val@creatartis.com).