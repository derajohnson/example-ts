import * as React from "react";
import {useState, useEffect} from "react";
import * as Pieces from "@pieces.app/pieces-os-client";
import {Application} from "@pieces.app/pieces-os-client";
import {DataTextInput, DeleteAssetIDInput, RenameAssetInput} from './components/TextInput';
import {Header} from './components/Header'
import {connect} from './utils/Connect'

// types
type LocalAsset = {
  name: string,
  id: string,
  classification: Pieces.ClassificationSpecificEnum,
}

//=============================[GLOBALS]================================//
let full_context: JSON;
let applicationData: Application;
let _indicator: HTMLElement;
let snippetList: Array<LocalAsset>;

// you primary App function where all react elements render at their core.
// for reactivity i added a number of state based properties here, and made the highest level
// a little more verbose.
//
// refresh is responsible for adding new assets to the snippet list itself when you create a new asset.
// the refresh button is connected to first <button> element you see below the header and div there.
export function App(): React.JSX.Element {

  const [items, setItems] = useState<Array<LocalAsset>>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = React.useMemo(() => {
    if (searchTerm) {
      const searchTermRegex = new RegExp(searchTerm, 'i');
      return items.filter(e => searchTermRegex.test(e.name));
    }
    return items;
  }, [searchTerm, items]);


  const refresh = (_newAsset: LocalAsset) => {
    setItems(prevArray => [...prevArray, _newAsset])
  }

  useEffect(() => {
    refreshSnippetList();
    }, []);

  const clearArray = () => {
    setItems([])
  }

  const handleSelect = (index) => {
    setSelectedIndex(index!=selectedIndex?index:-1);
  };

  function refreshSnippetList() {
    new Pieces.AssetsApi().assetsSnapshot({}).then((assets) => {
      // console.log('Response', assets)
      clearArray()

      for (let i = 0; i < assets.iterable.length; i++) {
        let _local: LocalAsset = {
          id: assets.iterable[i].id,
          name: assets.iterable[i].name,
          classification: assets.iterable[i].original.reference.classification.specific
        }

        refresh(_local);

      }
    })
    
  }

  return (
      <div style={{ padding: '10px 20px' }}>
          <Header setSearchTerm={setSearchTerm} />
          <div style={{ width: "auto", border: '2px solid black', height: '400px', padding: '20px', borderRadius: '9px' }}>
          <div style={{ overflow: "scroll", height: 'inherit' }}>
              {filteredItems.map((item: LocalAsset, index) => (
                <div
                  key={index}
                  style={{
                    marginTop: '5px',
                    marginBottom: '5px',
                    alignItems: 'center',
                    padding: "10px",
                    borderRadius: '10px',
                    border: '1px solid gray',
                    maxHeight: '100px',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: "space-between",
                    backgroundColor: selectedIndex == index ? 'lightblue' : 'white', // Add background color based on selection
                    cursor: 'pointer' // Add cursor style to indicate clickability
                  }}
                  onClick={() => handleSelect(index)} 
                >
                    <div>
                      <h3>{item.name}</h3>
                      <div style={{ flexDirection: "column" }}>
                        <p>{item.id}</p>
                        <p>{item.classification}</p>
                      </div>
                    </div>
                  </div>

                  ))}
                  {searchTerm && !filteredItems.length && <div>
                      <p style={{textAlign:"center"}}>No search result found</p>
                    </div>
                    }

              </div>
          </div>

          <div style={{display: 'flex', flexDirection: 'column'}}>
              <button style={{ maxWidth: '100px', marginTop: '10px',}} onClick={refreshSnippetList}>Refresh</button>
              <h3>Create a Snippet</h3>
              <DataTextInput applicationData={applicationData}/>
              <h3>Delete Snippet</h3>
              <DeleteAssetIDInput assetID={(selectedIndex!=-1? items[selectedIndex].id:"")}/>
              <h3>Rename Snippet</h3>
              <h4>New Name:</h4>
              <RenameAssetInput assetID={(selectedIndex!=-1? items[selectedIndex].id:"")}/>
          </div>
      </div>
  )
}

connect().then(__ => {
  // TODO: this needs improvement but is okay for now. since the types are not here yet,
  // for some reason i had to parse the stringified full_context object to get correct typing.
  full_context = __;
  let _t = JSON.parse(JSON.stringify(full_context));
  applicationData = _t.application;
  console.log('Application Data: ', applicationData);

  // define the indicator now that it exists.
  _indicator = document.getElementById("indicator");

  // conditional for the response back on application.
  if (__ != undefined) {
      _indicator.style.backgroundColor = "green";
  } else {
      _indicator.style.backgroundColor = "red";
  }

})