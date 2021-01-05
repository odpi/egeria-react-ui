<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- Copyright Contributors to the ODPi Egeria project 2020. -->


The **Glossary Author** is an allows you to author glossary content, such as Glossary , Term, Categories
and the relationships between them.

# Concepts

Egeria has subject area open types that are described in [Area 3](https://egeria.odpi.org/open-metadata-publication/website/open-metadata-types/Area-3-models.html). This mature model of glossary content shows you the relevant concepts around glossaries.

The Glossary Author exposes concepts (json objects) that map onto the open types. The Glossary Author concepts are intended to make it easier for a 
user interface to author glossaries. 

As metadata is often best thought of as a graph; the Glossary author user interface exposes the concept of a Graph contining only the concepts relevantg to a 
glossary author. The Graph is composed of Nodes (vertices) and Lines (edges).  

The Node is the top level parent object for Glossary, Category and Term, which in turn have child objects; these all map back to the Area 3 concepts. The Node object contains standard Egeria properties including:

* Name - name to be displayed.
* qualfied name - readable unique name
* guid - global unqiue identifier, unique identifier.
* Effective startyand end times - to indicate when the node is effective.    

 ![Glossary author node model](Glossary author Node.png)  

# Working with the Glossary Author user interface.

Note the screenshots might be slightly out of date with the code base. 

## Getting to the Glossary Author start screen
- After logging into the Egeria react UI, you will see tasks at the left hand side of the user interface including the glossary author task.
![Left hand side of the user interface](leftnav.png)  
- If you see a screen with a connect button like this ![connect button](connect.png) then the glossary author is not able to issue a successfully glossary call; this is caused by either
   - the Subject Area OMAS is not active, so the glossary author cannot call it
   - the glossary author view is not configured on the view server.
   - the presentation server is not configured to point to the glossary server view service.   
   If everythign is correctly configured but the view server or its downstream server is not started then, start them and press the connect button.  
- Assuming you have successfully connected, then you are now in a position to author glossary content and should see
![Empty start screen](emptystartscreen.png)  
- You will notice that you can choose the node to work with using the node tabs
![nodetabs](nodetabs.png)

## Add a glossary
- Add a node on a tab using the ![add](add.png) add button. Pressing add for glossary will show
 ![glossaryaddinput](glossaryaddinput.png). The minimal input is a name.
pressing create will show a screen like : 
 ![glossaryaddresult](glossaryaddresult.png)

 ## Working with a glossary
- Navigating back after having created a glossary called 'glossary1' in an empty system will show you 
 ![start screen with one glossary](startscreenwithoneglossary.png)
- 'List view' You can toggle the glossary view to show the glossaries as a list
![start screen with one listed glossary](startscreenwithonelistedglossary.png)
- 'paging' - notice the paging options, these allow you to change the page size (how many are displayed), page through the results if there is more than a page's worth to display.
- 'filter' Entering text into the filter box ![filter](filter.png) filters the displayed results. If you want an exact match, check ![Exact match](exactmatch.png)]     

## Button that appear when a node is selected 
- Note that there is a checkbox on the node card; when checked, buttons appear indicating actions you can perform against the selected node:
  - ![Quick terms](quickterms.png) - this is shown for glossary, to quickly create Terms under the selected glossary
  - ![children](children.png) - this shows the children of the selected node.
  - ![edit](edit.png) - this displays an edit screen for the selected node
  - ![delete](delete.png) - this deletes the selected node. Glossaries with content cannot be deleted.

## Quick terms
- The quick term screen looks like this:
 ![initialquickterms](initialquickterms.png) 
- Press the + button to add extra rows
 ![quicktermswithblankrows](quicktermswithblankrows.png) 
- fillin the name and description in the rows
 ![quick terms with names](quicktermswithnames.png) 
- press Create Terms on Server button to show
 ![quick terms results](quicktermsresults.png) 

## Working with Categories and Terms
Working with Categories and terms, is similar to working with Glossaries, apart from
  - choosing the Term or Category node tab, Terms or Categories can be created, in this case a wizard is displayed to aske the user to choose the glossary in which the term should be created. Here is the first page of the term wizard
   ![term wizard](termwizard.png) 

## Glossary children
When chosing the glossary children, the categories and terms under that glossary are displayed. 
 ![Glossary Children](glossarychildren.png) 
By default top categories are displayed, these are categories that do not have a parent category. If you want to see the all the categories under the glossary then toggle the Top Categories ![top cats](topcats.png) to All Categories ![all cats](allcats.png).

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
