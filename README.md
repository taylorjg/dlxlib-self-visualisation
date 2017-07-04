[![CircleCI](https://circleci.com/gh/taylorjg/dlxlib-self-visualisation.svg?style=svg)](https://circleci.com/gh/taylorjg/dlxlib-self-visualisation)

## Description

[dlxlib](https://www.npmjs.com/package/dlxlib) is a JavaScript implementation of
[Dancing Links](http://en.wikipedia.org/wiki/Dancing_Links).
This little web app visualises the manipulation of the links within the internal data structures of [dlxlib](https://www.npmjs.com/package/dlxlib) as the algorithm progresses.

> **NOTE:** this repo uses a local copy of [dlxlib](https://www.npmjs.com/package/dlxlib)
> with a few small changes in order to expose the internal data structures that would
> normally remain hidden.

At each step, every right, left, up and down link is visualised. Also, the submatrix and partial solution rows are shown. Use the navigation buttons (or swipe the figure left/right on touch devices) to step through the algorithm as it solves the matrix.

If you click on a node, details of its links are displayed e.g.:

```
node:             (E, 7)
right:            (H, 7)
left:             (C, 7)
down:             (E, -1)
up:               (E, -1)
right tweeners:   
left tweeners:    
down tweeners:    
up tweeners:      [(E, 0), (E, 3)]
```

I have also included the ability to change how the algorithm chooses column `c`.
There are three possibilities:

* Leftmost uncovered column with the fewest 1's (this is the default)
* Leftmost uncovered column
* Rightmost uncovered column

It is interesting to observe how this changes the course of the algorithm (although the same solution(s) are found).

## Notes

* It is possible to discover all nodes during the initial search step
    * no nodes are covered so they are all reachable from `root`
    * I call this `allNodes` (an array of all nodes representing the 1's in the matrix plus `root` and the column headers)
    * we stash `allNodes` on `root` along with `numCols` and `numRows`

* We only need to render the node rects and dots once because they never change in subsequent search steps
    * only the links change

* We need to take a snapshot of the state of all the links during `onSearchStep`
    * because the whole internal data structure is mutable
    * we create all the necessary SVG elements (lines and paths) re links and arrow heads during the search step
    * we stash these in an array so that we can display the steps in response to navigation via the buttons
    * to display a step:
        * first remove all the previous step's SVG elements
        * add all the step's SVG elements to the DOM document

* Finding covered nodes for any search step involves take the diff of `allNodes` and all the currently reachable nodes (from `root`)
    * we do this so that we can highlight all the covered nodes
    * when switching to a new search step, we first reset the highlights

* When drawing a link, we need to know whether the target node is an adjacent node or not
    * adjacent links are drawn as straight green lines
    * non-adjacent links are drawn as curved red paths 
    * when non-adjacent, we need to identify the covered nodes between the `from` node and the `to` node
        * I call these the `tweeners`
        * we need to handle non-adjacent links that wrap around
            * see `makeNormalRange()` and `makeWrapAroundRange()`
    * we can calculate the `tweeners` by examining `allNodes`

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
