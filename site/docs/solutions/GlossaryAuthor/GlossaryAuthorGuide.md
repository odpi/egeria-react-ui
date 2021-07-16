<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- Copyright Contributors to the ODPi Egeria project 2020. -->

# Glossary Author

The **Glossary Author** is a UI capability of the Egeria React UI that allows you to author glossary content, such as Glossaries, Terms, Categories
and the relationships between them.

## 1. Concepts

Egeria has subject area open types that are described in [Area 3](https://egeria.odpi.org/open-metadata-publication/website/open-metadata-types/Area-3-models.html). This mature model of glossary content describes the relevant concepts around glossaries.

The Glossary Author exposes concepts (json objects) that map onto the open types. The Glossary Author concepts are intended to make it easier for a 
user interface to author glossaries. 

As metadata is often best thought of as a graph; the Glossary author user interface exposes the concept of a Graph containing only the concepts relevant  to a glossary author. The Graph is composed of Nodes (vertices) and Relationships (edges).  

Glossary, Category and Term are all types of Node. The Node object contains standard Egeria properties including:

* Name - name to be displayed.
* qualfied name - readable unique name
* guid - global unique identifier.

Glossary Author Node inheritance model, including the nodes that inherit from Term , Category and Glossary. 
 <img src="Glossary author Node.png" alt="Glossary author node model" width="200px" />

## 2. Working with the Glossary Author user interface.


## 2.1 Getting to the Glossary Author start screen
- After logging into the Egeria react UI, you will see tasks at the left hand side of the user interface including the glossary author task.
- If you see a screen with a connect button, then the glossary author is not able to issue a successfully glossary call; this is caused by either
   - the Subject Area OMAS is not active, so the glossary author cannot call it
   - the glossary author view is not configured on the view server.
   - the presentation server is not configured to point to the glossary server view service.   
   If everythign is correctly configured but the view server or its downstream server is not started then, start them and press the connect button.  
- Assuming you have successfully connected, then you are now in a position to author glossary content 
- You will notice that you can choose the node to work with using the node tabs.

## 2.2 Add a glossary
- Add a node on a tab using the add (+) button. Pressing add for glossary will show a form to input properties. The minimal input is a name.

 ## 2.3 Working with a glossary
- Navigating back after having created a glossary called 'glossary1' in an empty system, will show one glossary in a 'card view'
- 'List view' You can toggle the glossary view to show the glossaries as a list
- 'paging' - notice the paging options, these allow you to change the page size (how many are displayed), page through the results if there is more than a page's worth to display.
- 'filter' Entering text into the filter box, filters the displayed results. If you want an exact match, check the exact match box.

## 2.4 Buttons that appear when a node is selected 
- Note that there is a checkbox on the node card; when checked, buttons appear indicating actions you can perform against the selected node:
  - Quickterms button - this is shown for glossary, to quickly create Terms under the selected glossary
  - Children button -  this shows the children of the selected node.
  - edit button - this displays an edit screen for the selected node
  - delete button - this deletes the selected node. Glossaries with content cannot be deleted.
  - glove button - visualisation described later

## 2.5 Quick terms
- The quick term screen lists the terms to be added. Initially it is empty
- Press the + button to add extra rows
- fill in the name and description in the rows
- press Create Terms on Server button to show a screen indicaing whetehr the terms have been created or not.

## 3. Working with Categories and Terms
Working with Categories and terms, is similar to working with Glossaries, apart from
  - choosing the Term or Category node tab, Terms or Categories can be created, in this case a wizard is displayed to aske the user to choose the glossary in which the term should be created. 

## 4. Glossary children
When the glossary children action is chosen, the categories and terms under that glossary are displayed. 
By default top categories are displayed, these are categories that do not have a parent category. If you want to see the all the categories under the glossary then toggle the Top Categories to All Categories 

## 5. Breadcrumb
While navigating, a breadcrumb is created showing how deep the current node is that is being authored. 

## 6. Glove
Glove is a visualisation that can be displayed when there is a selected node, it displays a canvas with the single node on it.It is then possible to 
* explore from the node to other glossary content.
* Author new relationsips and nodes 
* search and add new nodes to the canvas 


## 7. Future improvements
- a breadcrumb to be optimized to minimize the url length.
- add governance classification authoring
- add spine object views
- add collaboration authoring and viewing
- start with a context from the community profile.   
