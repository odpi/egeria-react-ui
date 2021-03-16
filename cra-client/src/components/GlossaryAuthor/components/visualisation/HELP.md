## Glossary Author Visualiser User Interface

&nbsp;

The GLOssary author Visualiser and Explorer (GLOVE) interface provides a way to visualise glossary artifacts in Egeria. It is possible to retrieve nodes and lines, view their properties and display them as a graph of interconnected objects. The instances are presented both textually (on the left side) and diagrammatically (on the right side).

&nbsp;

![GLOssary author Visualiser and Explorer Interface](image1)

&nbsp;

### Using the GLOVE Interface
When the GLOVE interface first loads, it displays a partifcular glossary artifact (A Glossary Category or Term). This os the focus node.

&nbsp;

You can explore the neighborhood around the focus node by clicking on the Explore button to perform a graph traversal. This will present a dialog that allows you to refine the graph traversal by filtering the types of nodes and lines that will be retrieved. When the traversal is complete, the nodes and lines are added to the graph.

&nbsp;

### Diagram Controls
The diagram has two layout modes - 'time-based' and 'proximity-based'. The 'time-based' layout arranges objects vertically on the diagram with the newest toward the bottom. The 'proxmity-based' layout allows the graph of objects to organize itself based on connectivity. 

&nbsp;

If the 'pin dragged nodes' checkbox is checked, when the user drags an object it will be pinned where it is dropped. A pinned node is indicated by a small 'pin' drawn vertically beneath the node. It can be dragged again if needed, but it will always stay where it is dropped. To release an individual object, press shift and click on the object. To allow objects to move around independently, uncheck the 'pin dragged nodes' option.

&nbsp;

### Undo and Clear
There are buttons to undo the most recent operation (`Undo`) or clear (`Clear`) the whole graph.

&nbsp;

### History
There is a `History` button to display a summary of the operations performed by the user since the graph was last empty.
