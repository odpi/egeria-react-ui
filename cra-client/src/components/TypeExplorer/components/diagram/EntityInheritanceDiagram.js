/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext,
                useState,
                useEffect,
                useRef,
                useCallback }             from "react";

import { TypesContext }                   from "../../contexts/TypesContext";

import { FocusContext }                   from "../../contexts/FocusContext";

import * as d3                            from "d3";

import PropTypes                          from "prop-types";

import "./diagram.scss";


/*
 * The EntityInheritanceDiagram renders a tree of entity types organised as a 
 * hierarchy by inheritance. The tree is clickable for selection of an entity 
 * type and collapse/expand of a subtree.
 * 
 */

export default function EntityInheritanceDiagram(props) {


  const typesContext = useContext(TypesContext);

  const focusContext = useContext(FocusContext);

  const width                       = 1400;
  const margin                      = {top: 30, right: 30, bottom: 30, left: 30};



  /*
   * Need to retain d3 across calls to render diagram
   */
  const d3Container                       = useRef(null);

  const drgContainerDiv                   = useRef();

  const [renderedTrees, setRenderedTrees] = useState({});

  let scrolled = useRef(false);

  let treeDepth = useRef(0);
  

  /*
   * This method clears any introductory text or previous rendering of the diagram, and resets control properties
   */
  const initialiseInheritanceDiagram = useCallback(

    () => {

      const svg = d3.select(d3Container.current);

      svg.selectAll("svg").remove();

      /*
       * Clear the introductory text...
       */
      svg.innerHTML = "";

      /*
       * Initialise control state...
       */
      setRenderedTrees([]);
      scrolled.current = false;
    },
    [d3Container]
  );


   /*
   * Recursively work down the tree adding subtrees...
   */
  const addSubTree = useCallback(

    (tree, name, childNames, nodeDepth) => {

      /*
       * Add the current node then recurse for the children
       */
      const level = nodeDepth;
      if (nodeDepth > treeDepth.current) {
        treeDepth.current = nodeDepth;
      }
      tree.name = name;
      tree.category = "Entity";
      if (childNames !== null && childNames.length > 0) {
        tree.children = [];
        const childNamesSorted = childNames.sort();
        childNamesSorted.forEach( childName => {
          const entityType = typesContext.getEntityType(childName);
          if (entityType) {
            const nodeChildNames = entityType.subTypeNames;
            let subtree = {};
            addSubTree(subtree, childName, nodeChildNames, level + 1);
            tree.children.push(subtree);
          }
        });
      }
      return tree;
    },
    [typesContext.getEntityType]
  );



  /*
   * This method creates the inheritance tree for a single root entity
   */
  const createInheritanceTree = useCallback(

    (typeName) => {

      let inheritanceTree = {};

      /*
       * Start at the type with typeName and follow subtype links to compose children
       */
      const entityType = typesContext.getEntityType(typeName);
      if (entityType) {
        const childNames = entityType.subTypeNames;
        inheritanceTree = addSubTree(inheritanceTree, typeName, childNames, 1)
        return inheritanceTree;
      }
      return null;
    },
    [addSubTree, typesContext.getEntityType]
  );

   /*
   * Render one inheritance tree
   */
  const renderInheritanceTree = useCallback(

    (typeHierarchy, typeName, treeDepth) => {

      let thisTree     = {};
      thisTree.dx      = 30;
      thisTree.dy      = width / treeDepth.current;
      thisTree.root    = d3.hierarchy(typeHierarchy);
      thisTree.root.x0 = thisTree.dy / 2;
      thisTree.root.y0 = 0;
      thisTree.root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        /*
         * For nodes to be initially in collapsed state, set d.children = null;
         */
      });

      thisTree.svg = d3.select(d3Container.current)
                       .append("svg")
                       .attr("width", width)
                       .attr("height", thisTree.dx)
                       .attr("viewBox", [-margin.left, -margin.top, width, thisTree.dx])
                       .style("font", "12px sans-serif")
                       .style("user-select", "none");

      thisTree.gLink = thisTree.svg
                               .append("g")
                               .attr("fill", "none")
                               .attr("stroke", "#888")
                               .attr("stroke-opacity", 0.4)
                               .attr("stroke-width", 1.5);

      thisTree.gNode = thisTree.svg
                               .append("g")
                               .attr("cursor", "pointer");

      /*
       * Remember this tree
       */
      const loc_renderedTrees = renderedTrees;
      loc_renderedTrees[typeName] = thisTree;
      setRenderedTrees(loc_renderedTrees);
    },
    [margin.left, margin.top, renderedTrees]
  );

  /*
   * This method iterates over the known entity types and creates a separate tree for
   * any that have no supertype (i.e. the entity is itself a root)
   * For each such root, create the inheritance tree and render it
   */
  const createInheritanceTrees = useCallback(

    () => {

      /*
       * The inheritance diagram shows the type hierarchy of entity types.
       * The user may have already selected a type (of any category) but it is optional
       *
       * Each inheritance tree needs to be formatted as follows:
       *
       * {
       *   "name": "alpha",
       *   "children": [
       *     {
       *       "name": "beta"
       *     },
       *     {
       *       "name": "gamma"
       *     },
       *   ]
       * }
       *
       *
       * The createInheritanceTree method will get an entity type and its subtypes from
       * the typesContext and produce the necessary tree.
       */


      /*
       * For any entity types that don't have a supertype - create a tree
       * Those with supertypes will be included in one of the trees.
       * Tree roots are processed in alpha order
       */

      const entityTypes = typesContext.getEntityTypes();
      const entityTypeNamesUnsorted = Object.keys(entityTypes);
      const entityTypeNamesSorted = entityTypeNamesUnsorted.sort();
      entityTypeNamesSorted.forEach(entityTypeName => {
        if (entityTypes[entityTypeName].entityDef.superType == null) {
          const typeName = entityTypes[entityTypeName].entityDef.name;
          treeDepth.current = 0;
          const tree = createInheritanceTree(typeName);
          if (tree)
            renderInheritanceTree(tree, typeName, treeDepth);
        }
      })
    },
    [createInheritanceTree, renderInheritanceTree, typesContext.getEntityTypes]
  );


  /*
   * Draw a curved path from parent node to child node
   */
  const curvedPath = ({source, target}) => {
    return 'M' + source.y + ',' + source.x
         + 'C' + (source.y + target.y)/2 + ',' + source.x
         + ' ' + (source.y + target.y)/2 + ',' + target.x
         + ' ' + target.y + ',' + target.x
  }



  const incrementalScroll = useCallback(

    (drg, typeName, h_togo, v_togo, inc) => {

      let v_dirinc, h_dirinc;

      /*
       * Vertical dimension
       */
      let v_inc = inc;

      if (Math.abs(v_togo) < v_inc) {
        v_inc = Math.abs(v_togo);
      }
      const v_rate = Math.abs(v_togo) / (10 * v_inc);
      if (Math.abs(v_togo) > 0) {
        v_dirinc = Math.sign(v_togo) * v_inc * v_rate;
        /*
         * scrollBy does not seem to work when in a web component
         * scrollIntoView (which could be called from scrollSelectedIntoView() almost works
         * but the center and smooth options are not well-supported across browsers
         */
        v_togo = v_togo - v_dirinc;
      }

      /*
       * Horizontal dimension
       */
      let h_inc = inc;
      if (Math.abs(h_togo) < h_inc) {
        h_inc = Math.abs(h_togo);
      }
      const h_rate = Math.abs(h_togo) / (10 * h_inc);
      if (Math.abs(h_togo) > 0) {
        h_dirinc = Math.sign(h_togo) * h_inc * h_rate;
        /*
         * scrollBy does not seem to work when in a web component
         * scrollIntoView (which could be called from scrollSelectedIntoView() almost works
         *  but the center and smooth options are not well-supported across browsers
         */
        h_togo = h_togo - h_dirinc;
      }

      drg.scrollBy(h_dirinc, v_dirinc);

      if (Math.abs(h_togo) > h_inc || Math.abs(v_togo) > v_inc) {
        setTimeout( () => incrementalScroll(drg, typeName, h_togo, v_togo, inc) , 10);
      }
    },
    []
  );


  /*
   * If an entity type is selected and the view has not already been scrolled, scroll it now.
   */
  const scrollSelectedIntoView = useCallback(

    (typeToView) => {

      /*
       * Conversion is necessary between bounding client rectangle and
       * parent container offset position, which requires (fixed) offsets to accommmodate
       * top and lhs containers.
       */
      const topOffset =  230;
      const leftOffset = 500;

      if (scrolled.current === false) {
        scrolled.current = true;

        if (typeToView !== undefined && typeToView !== "") {

          const elem = document.getElementById('elem'+typeToView);

          /*
           * scrollIntoView almost works but the options do not work across browsers,
           * including Safari, so it does not center and is not smooth. The lack of centering
           * means it doesn't unscroll a scrolled diagram
           * The following is what we might *like* to do:
           * elem.scrollIntoView({behavior: "smooth", block:"center", inline:"center"});
           *
           * Instead of scrollIntoView - use incremental scrolling.
           */
          const brect = elem.getBoundingClientRect();

          let v_togo = brect.top-(topOffset + props.outerHeight/2.0);
          let h_togo = brect.left-(leftOffset + props.outerWidth/2.0);

          const inc = 10;

          const drg = document.getElementById("drawingContainer");
          incrementalScroll(drg, typeToView, h_togo, v_togo, inc);

        }
      }
    },
    [incrementalScroll, props.outerHeight, props.outerWidth]
  );



  const transitionComplete = useCallback(

    () => {

      /*
       * Earliest opportunity to scroll accurately
       *
       * Protect the diagram from an underlying change of focus - which could be to a different valid
       * type, to no type ("none"), or to an absent (e.g. deprecated) type. The diagram needs to check
       * with the TypesContext that any type is still valid.
       *
       * There is a deliberate case where this function will drop through without doing anything. That is
       * because it can afford to wait for the pending focus clearing by the focus context, which will then
       * cause a tree update this function will agan be called and adopt the 'fallback' of scrolling to the
       * root type.
       */

      if (focusContext.focus !== "" && focusContext.focus !== "none") {
        if (typesContext.getEntityType(focusContext.focus)) {
          scrollSelectedIntoView(focusContext.focus);
        }
      }
      else {
        scrollSelectedIntoView("OpenMetadataRoot");
      }
    },
    [focusContext.focus, scrollSelectedIntoView, typesContext.getEntityType]
  );



  /*
   * Indicate whether a node should be highlighted
   */
  const inhHighlight = useCallback(
    (d) => {
      /*
       * Check whether node is selected as focus
       */
      if (focusContext.focus === d.data.name) {
        return true;
      }
      return false;
    },
    [focusContext.focus]
  );

  /*
   * Because all types in the inheritance diagram are entity types, the selection of a
   * type will request a change of focus.
   */
  const typeSelected = useCallback(
    (cat, typeName) => {

      focusContext.typeSelected("Entity", typeName);
    },
    [focusContext]
  );


  /*
   * Update a subtree within the diagram
   * 'subtree' is the node at the root of the subtree being updated
   */
  const update = useCallback(

    (tree, subtree, event) => {

      /*
       * Since an update is being performed, unset scrolled so that on transition completion
       * the code will re-evaluate the scroll position
       */
      scrolled.current = false;

      const thisTree = tree;

      const duration = event && event.altKey ? 2500 : 250;
     
      /*
       * Compute the new tree layout.
       */
      const treeLayout = d3.tree();
      treeLayout.nodeSize([thisTree.dx, thisTree.dy])
      treeLayout(thisTree.root);

      const root = thisTree.root;

      /*
       * Get the lists of nodes and links
       */
      const nodes = root.descendants();
      const links = root.links();

      /*
       * Calculate the overall height of the tree (across all the nodes - the tree is drawn horizontally)
       */
      let left  = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x)   left = node;
        if (node.x > right.x) right = node;
      });
      const height = right.x - left.x + margin.top + margin.bottom;

      const transition = thisTree.svg
                                 .transition()
                                 .duration(duration)
                                 .attr("height", height)
                                 .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
                                 .tween("resize", window.ResizeObserver ? null : () => () => thisTree.svg.dispatch("toggle"))
                                 .on('end',  () => transitionComplete() );

      /*
       * Update the nodes…
       */

      const node = thisTree.gNode
                           .selectAll("g")
                           .data(nodes, d => d.id);

      /*
       * Enter new nodes at the subtree root's prior position.
       */

      const nodeEnter = node.enter()
                            .append("g")
                            .attr("transform", d => `translate(${subtree.y0},${subtree.x0})`)
                            .attr("fill-opacity", 0)
                            .attr("stroke-opacity", 0);

      /*
       * Each node is rendered as a circle with decoration for expand/collapse, plus text label
       */

      nodeEnter.append("circle")
               .attr('id',d => "elem"+d.data.name)
               .attr("r", 6)
               .attr("stroke-width",1)
               .attr("stroke", "#000")
               .attr("fill", "#FFF")
               .on("click", (e, d) => {
                 d.children = d.children ? null : d._children;
                 update(tree, d, e);
               });

      nodeEnter.append("line")
               .attr("x1", 0).attr("y1", -2).attr("x2", 0).attr("y2", 2)
               .attr("stroke-width",1)
               .attr("stroke-linecap","round")
               .attr("stroke", d => d._children && !d.children ? "#000" : "#FFF")
               .attr("pointer-events","none");

      nodeEnter.append("line")
               .attr("x1", -2).attr("y1", 0).attr("x2", 2).attr("y2", 0)
               .attr("stroke-width",1)
               .attr("stroke-linecap","round")
               .attr("stroke", d => d._children ? "#000" : "#FFF")
               .attr("pointer-events","none");

      /*
       * node text consists of clickable text rendered on top of a shadow to provide contrast with links
       */

      nodeEnter.append("text")
               .attr("dy", "0.31em")
               .attr("x", 12)
               .attr("text-anchor", "start")
               .text(d => typesContext.isTypeDeprecated("Entity", d.data.name) ? "["+d.data.name+"]" : d.data.name )
               .on("click", d => { typeSelected("Entity", d.data.name); })
               .clone(true)
               .lower()
               .attr("stroke-linejoin", "round")
               .attr("stroke-width", 3)
               .attr("stroke", "white");

      /*
       * Transition nodes to their new position.
       */

      const nodeUpdate = node.merge(nodeEnter).transition(transition)
                             .attr("transform", d => `translate(${d.y},${d.x})`)
                             .attr("fill-opacity", 1)
                             .attr("stroke-opacity", 1);

      /*
       * Toggle minus to plus depending on collapsed/expanded state...
       */
      nodeUpdate.select('line')
                .attr("x1", 0).attr("y1", -2).attr("x2", 0).attr("y2", 2)
                .attr("stroke", d => d._children && !d.children ? "#000" : "#FFF");

      /*
       * Highlight a selected node, if a type has been selected and selectedCategory is Entity
       */
      nodeUpdate.selectAll('text')
                .attr("fill", d => inhHighlight(d) ? "blue" : "black" );

      /*
       * Transition exiting nodes to the parent's new position.
       */
      const nodeExit = node.exit();
      nodeExit.transition(transition).remove()
                                     .attr("transform", d => `translate(${subtree.y},${subtree.x})`)
                                     .attr("fill-opacity", 0)
                                     .attr("stroke-opacity", 0);

      /*
       * Update the links…
       */

      const link = thisTree.gLink
                           .selectAll("path")
                           .data(links, d => d.target.id);

      /*
       * Enter any new links at the parent's prior position.
       */

      const linkEnter = link.enter()
                            .append("path")
                            .attr("d", d => {
                              const o = {x: subtree.x0, y: subtree.y0};
                              var curve = curvedPath( {source : o , target : o } );
                              return curve;
                            });


      /*
       * Transition links to their new position.
       */

      link.merge(linkEnter)
          .transition(transition)
          .attr("d", d => {
            const s = {x: d.source.x, y: d.source.y};
            const t = {x: d.target.x, y: d.target.y};
            var curve = curvedPath( {source : s , target : t } );
            return curve;
          });

      /*
       * Transition exiting nodes to the parent's new position.
       */

      link.exit()
          .transition(transition)
          .remove()
          .attr('d', function (d) {
            const o = {x: subtree.x, y: subtree.y};
            var curve =  curvedPath( {source : o , target : o } );
            return curve;
          });

      /*
       * Remember the current positions as prior positions - they will be used to calculate transitions
       */

      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

    },
    [inhHighlight, curvedPath, margin.bottom, margin.left, margin.top, transitionComplete, typeSelected,
     typesContext.isTypeDeprecated]
  );


  /*
   * Refresh all trees in the diagram.
   * This method is called on initial rendering and if the focus type is changed
   */
  const updateAllTrees = useCallback(

    () => {

      const treeNames = Object.keys(renderedTrees);

      treeNames.forEach(treeName => {
        const thisTree = renderedTrees[treeName];
        const root = thisTree.root;
        if (root !== undefined) {
          update(thisTree, root);
        }
      });
    },
    [renderedTrees, update]
  );


  useEffect(
    () => {

      if ( d3Container.current && typesContext.tex) {
        /*
         * Initial rendering...
         * Get the entity types and create and render the trees (one per root)
         * Call update() on each of the trees.
         *
         * Data is unlikely to change unless server is changed - repeat the initial rendering...
         */ 
        initialiseInheritanceDiagram();

        createInheritanceTrees();

      }
    },

    [typesContext.tex]
  )


  useEffect(
    () => {
      if ( d3Container.current && typesContext.tex) {
        updateAllTrees();
      }
    },
    [typesContext.tex, focusContext.focus, updateAllTrees]
  )


  useEffect(
    () => {
      drgContainerDiv.current.style.width=""+props.outerWidth+"px";
      drgContainerDiv.current.style.height=""+props.outerHeight+"px";
    },
    [props.outerHeight, props.outerWidth]
  )
  

  return (
    <div className="drawing-container" id="drawingContainer" ref={drgContainerDiv}>
      <div id="drawingArea" ref={d3Container}>
      </div>
    </div>
  );

}


EntityInheritanceDiagram.propTypes = {
  children: PropTypes.node,
  outerHeight: PropTypes.number,
  outerWidth: PropTypes.number
}
