/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

export default function getPathTypesAndGuids(path) {
  // const [pathAnalysis, setPathAnalysis] = useState();
  // console.log("usePathAnalyser path " + path)

  // useEffect(() => {
  //   console.log("useeffect path run");
  // }, [path]);
  // useEffect(() => {
    // console.log("useeffect run AAAAAAAAAAAAAAAAAAH");
    // analyse the path.

    // the path will be of the following form after the glossary-author segment

    // <typename plural> / <guid>
    // or
    // <typename plural> / <guid> / <typename plural>
    // or 
    // <typename plural> / <guid> / <typename plural> / <guid>
    // or
    // <typename plural> / <guid> repeated ending with <guid> or <typename plural>

    // split by backslash
    // and store in an array of elements that are contain the type and the guid. 
    // callers can then interrogate this array to get the type and guids they need  
    // alert("path "+ path ); 
    let segments = path.split("/");
    // get rid of the uninteresting first part
    // while (segments.length > 0 && segments[0] !== "glossary-author") {
    //   segments.shift();
    // }
    let typesGuidArray = [];
    while (segments.length > 0 ) {
      const types = segments[0];
      segments.shift();
      let guid;
      if (segments.length > 0) {
        guid = segments[0];
        segments.shift();
      }
      let typesGuid = {};
      typesGuid.types = types;
      typesGuid.guid = guid;
      if (types === "glossaries") {
        typesGuid.type = "glossary";
      } else if (types === "categories") {
        typesGuid.type = "category";
      } else if (types === "terms") {
        typesGuid.type = "term";
      }
      typesGuidArray.push(typesGuid);
    }

    console.log("Analysis " + JSON.stringify(typesGuidArray)); 
    // setPathAnalysis(typesGuidArray);
  // });

  // return pathAnalysis;
  return typesGuidArray;
}
