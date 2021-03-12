<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- Copyright Contributors to the ODPi Egeria project. -->
 
![In Development](../../../../../../open-metadata-publication/website/images/egeria-content-status-in-development.png#pagewidth)

# Approaches to authoring semantic content  

## Glossary Author
This folder includes design artifacts created around the subject area UI in the UI chassis. 
After this time, we realised that the approach was glossary centric. So we renamed this approach 
as a glossary author approach.

## Subject Area
A Subject Area approach would start from the Subject Area and probably would not be interested in the glossaries. 

# Overall flow of the Glossary Author user interface

## Home page

The initial (home) page of the glossary author displays 3 tabs for glossary , Terms and Categories. The tab shown by default is the glossary tab. 

## Pages in the Glossary Author
There is a similar look to the Glossary , Category and Term pages, they all:
* default to showing a card view. A card shows the name of the artifact with an icon and a select box 
* this is a checkbox allowing the user to toggle to a list view , where an artifact can be selected.
* there is a search box at the top that filters the current content. 
* there is a paging widget at the bottom of the page, so the user can page through results.
* There is a + button to add a new artifact, the add it done withinthe current context:
    * terms and categories displayed una glossary will be created under that glossary
    * at the top level terms and cateogies can be created , a wizard is shown asking the user to choose under which glosssary they should be created.  
* when an artifcat is selectedon the list or card view, new buttons appear. All artifacts have 
    * a delete button - to delete the selected artifact         
    * an edit button - to edit the seleted artifact
    * a visualisation button - to display the selected artifact on a canvas and allow the user to explore its neighbour artifacts. This part of the Ui is known as the GLOssary Visualisation and Explorer (Glove).
* Addition buttons appear for different artifacts
    * a quick terms button is present for glossaries, this allows the user to quickly add a bumber of glossaries at the same time. 
    * a children button is present for glossary and category thisshows the child terms and caterories
            
** Glove design

Glove uses a similar interaction pattern to the Repository Explorer. The key architectureal differences are:
1) Glove works with Subject Area Nodes and Lines (not OMRS entities and relationships). So it works with concepts that the glossary author is 
familiar with.
2) Glove is started by pressing the visualisation button having selected a node from search results. The Glove UI will display this node as its inital state. 
3) Explore of this selected node, shows a pre travesal screen with the number of each node or line - so the user can filter what should be displayed. When this is completed the user is shown the additional nodes (kneon as a generation or gen) on the canvas. 
4) The additional nodes on the canvas can be explored producing new gens. It is possible to undo a gen and there is a history.
5) Undo undoes the last generation, back to the first node. 
6) Clear clears all the generation back to the first generation whcih contains the original node
7) Glove differs from the Repository Explorer in that it does not have a typeexplorer. The repository explorer creartes displayable content in the view service including labels. For Glove the information used to display artifacts is defined in the client side javascritp. It is keyed of 2 files NodeTypes and lineTypes. These files contain the shape of the nodes, how to display them and the url to use when issuing rest calls for them.
  




















----
License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/),
Copyright Contributors to the ODPi Egeria project.