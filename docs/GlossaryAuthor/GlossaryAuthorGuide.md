<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- Copyright Contributors to the ODPi Egeria project 2020. -->

# Glossary Author

The **Glossary Author** is a UI capability of the Egeria React UI that allows you to author glossary content, such as Glossaries, Terms, Categories
and the relationships between them.

# Concepts

Egeria has subject area open types that are described in [Area 3](https://egeria.odpi.org/open-metadata-publication/website/open-metadata-types/Area-3-models.html). This mature model of glossary content describes the relevant concepts around glossaries.

The Glossary Author exposes concepts (json objects) that map onto the open types. The Glossary Author concepts are intended to make it easier for a 
user interface to author glossaries. 

As metadata is often best thought of as a graph; the Glossary author user interface exposes the concept of a Graph containing only the concepts relevant  to a glossary author. The Graph is composed of Nodes (vertices) and Lines (edges).  

Glossary, Category and Term are all types of Node. The Node object contains standard Egeria properties including:

* Name - name to be displayed.
* qualfied name - readable unique name
* guid - global unique identifier.
* Effective start and end times - to indicate when the node is effective.    

Glossary Author Node inheritance model, including the nodes that inherit from Term , Category and Glossary. 
 <img src="Glossary author Node.png" alt="Glossary author node model" width="200px" />

# Working with the Glossary Author user interface.

Note the screenshots might be slightly out of date with the code base, but hopefully help orientate the reader. 

## Getting to the Glossary Author start screen
- After logging into the Egeria react UI, you will see tasks at the left hand side of the user interface including the glossary author task.
<img src="leftnav.png" alt="Left hand side of the user interface" width="200px" width="200px" height="200px" />
- If you see a screen with a connect button like this <img src="connect.png" alt="connect button"  width="70px" height="40px" /> then the glossary author is not able to issue a successfully glossary call; this is caused by either
   - the Subject Area OMAS is not active, so the glossary author cannot call it
   - the glossary author view is not configured on the view server.
   - the presentation server is not configured to point to the glossary server view service.   
   If everythign is correctly configured but the view server or its downstream server is not started then, start them and press the connect button.  
- Assuming you have successfully connected, then you are now in a position to author glossary content and should see
<img src="emptystartscreen.png" alt="Empty start screen" width="350px" height="100px" />  
- You will notice that you can choose the node to work with using the node tabs
<img src="nodetabs.png" alt="Node Tabs" width="350px" height="20px" /> 

## Add a glossary
- Add a node on a tab using the <img src="add](add.png) add button. Pressing add for glossary will show
 <img src="glossaryaddinput.png" alt="Glossary add input" width="400px" height="250px" /> . The minimal input is a name.
pressing create will show a screen like : 
 <img src="glossaryaddresult.png" alt="Glossary add result" width="400px" height="250px" /> 

 ## Working with a glossary
- Navigating back after having created a glossary called 'glossary1' in an empty system will show you 
 <img src="startscreenwithoneglossary.png" alt="start screen with one glossary" width="400px" height="300px" /> 
- 'List view' You can toggle the glossary view to show the glossaries as a list
<img src="startscreenwithonelistedglossary.png" alt="start screen with one listed glossary" width="400px" height="300px" /> 

- 'paging' - notice the paging options, these allow you to change the page size (how many are displayed), page through the results if there is more than a page's worth to display.
- 'filter' Entering text into the filter box <img src="filter.png" alt="Filter field" width="100px" height="20px" /> filters the displayed results. If you want an exact match, check <img src="exactmatch.png" alt="Exact match"   width="100px" height="20px" />   

## Button that appear when a node is selected 
- Note that there is a checkbox on the node card; when checked, buttons appear indicating actions you can perform against the selected node:
  - <img src="quickterms.png" alt="quick terms"  width="20px" height="20px" />  - this is shown for glossary, to quickly create Terms under the selected glossary
  - <img src="children.png" alt="children"  width="20px" height="20px" />  - this shows the children of the selected node.
  - <img src="edit.png" alt="edit"  width="20px" height="20px" />  - this displays an edit screen for the selected node
  - <img src="delete.png" alt="delete"  width="20px" height="20px" /> - this deletes the selected node. Glossaries with content cannot be deleted.

## Quick terms
- The quick term screen looks like this:
 <img src="initialquickterms.png" alt="initial quick terms"  width="300px" height="100px" /> 
- Press the + button to add extra rows
 <img src="quicktermswithblankrows.png" alt="quick terms with blank rows"  width="400px" height="300px" />
- fillin the name and description in the rows
 <img src="quicktermswithnames.png" alt="quick terms with names"  width="400px" height="300px" />
- press Create Terms on Server button to show
 <img src="quicktermsresults.png" alt="quick terms with results"  width="400px" height="200px" />

## Working with Categories and Terms
Working with Categories and terms, is similar to working with Glossaries, apart from
  - choosing the Term or Category node tab, Terms or Categories can be created, in this case a wizard is displayed to aske the user to choose the glossary in which the term should be created. Here is the first page of the term wizard
   <img src="Termwizard.png" alt="term wizard"  width="400px" height="200px" />

## Glossary children
When the glossary children action is chosen, the categories and terms under that glossary are displayed. 
 <img src="glossarychildren.png" alt="glossary children"  width="400px" height="200px" />
By default top categories are displayed, these are categories that do not have a parent category. If you want to see the all the categories under the glossary then toggle the Top Categories <img src="topcats.png" alt="top categories"  width="100px" height="30px" /> to All Categories <img src="allcats.png" alt="all categories"  width="100px" height="30px" />

## Future improvements
- a breadcrumb will be added to show visually where in a nested hierarchy the nodes being displayed live.
- Allow category hierarchies to be authored. i.e. child categories of categories
- Allow lines to be authored
- Use a D3 visualisation of glossary content similar to rex
- add governance classification authoring
- add spine object views
- add collaboration authoring and viewing
- start with a context from the community profile.   

----
License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/),
Copyright Contributors to the ODPi Egeria project.
