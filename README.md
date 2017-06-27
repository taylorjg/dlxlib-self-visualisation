[![CircleCI](https://circleci.com/gh/taylorjg/dlxlib-self-visualisation.svg?style=svg)](https://circleci.com/gh/taylorjg/dlxlib-self-visualisation)

## Description

[dlxlib](https://www.npmjs.com/package/dlxlib) is a JavaScript implementation of
[Dancing Links](http://en.wikipedia.org/wiki/Dancing_Links).
This little web app visualises the manipulation of the links within the internal data structures of [dlxlib](https://www.npmjs.com/package/dlxlib) as the algorithm progresses. At each step, every right, left, up and down link is visualised. Also, the submatrix and partial solutions rows are shown. Use the navigation buttons to step through the algorithm as it solves the matrix.

I have also included the ability to change the choice of column `c` - there are three possibilities:

* Leftmost uncovered column with the fewest 1's (this is the default)
* Leftmost uncovered column
* Rightmost uncovered column

It is interesting to observe how this changes the course of the algorithm (although the same solution(s) are found).

## Links

* [Knuth's original Dancing Links paper](https://arxiv.org/pdf/cs/0011047v1.pdf)
* [Knuth's Algorithm X (Wikipedia)](http://en.wikipedia.org/wiki/Algorithm_X)
* [Dancing Links (Wikipedia)](http://en.wikipedia.org/wiki/Dancing_Links)
* [Exact cover (Wikipedia)](http://en.wikipedia.org/wiki/Exact_cover)
* JavaScript implementation
    * [source code](https://github.com/taylorjg/dlxlibjs)
    * [npm package](https://www.npmjs.com/package/dlxlib)
    * [Visualisation of solving a Sudoku puzzle](https://sudoku-dlx-js.herokuapp.com/)
    * [Visualisation of solving a Tetris Cube puzzle](https://tetriscubewebgl.herokuapp.com/)
* C# implementation
    * [source code](https://github.com/taylorjg/DlxLib)
    * [NuGet package](https://www.nuget.org/packages/DlxLib/)
