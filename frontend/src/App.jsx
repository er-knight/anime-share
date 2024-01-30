import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"

async function compress(data) {
  const compressionStream = new CompressionStream("gzip")
  const writer = compressionStream.writable.getWriter()
  writer.write(data)
  writer.close()
  return new Response(compressionStream.readable).arrayBuffer()
}

function Card({ id, title, type, episodes, image_url, airing_period, rank, rating, selected }) {
  const [isSelected, setIsSelected] = useState(selected.current.includes(id))
  return (
    <div
      onClick={() => {
        setIsSelected(!isSelected)
        selected.current = isSelected
          ? selected.current.filter(value => value != id)
          : [...selected.current, id]
      }}
      className="relative text-slate-950 border border-slate-950 min-h-[240px] h-[calc((100vw/160px)*1.5px)] hover:cursor-pointer"
    >
      <img src={image_url} className="h-full w-full object-cover"></img>
      <div className={
        `flex flex-col justify-end p-1 absolute top-0 bottom-0 left-0 right-0 ${
          isSelected
            ? 'bg-gradient-to-b from-green-100/10 via-green-300/30 to-green-500'
            : 'bg-gradient-to-b from-blue-100/10 via-blue-300/30 to-blue-500'
        }`
      }>
        <div className="flex justify-between">
          <span className="font-bold tracking-tight text-xl">{`#${rank}`}</span>
          <span className="font-bold tracking-tight text-xl">{rating}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold tracking-tight text-nowrap overflow-hidden text-ellipsis">{type}</span>
          <span className="font-bold tracking-tight text-nowrap overflow-hidden text-ellipsis">{type != 'Movie' ? `${episodes} Episode${episodes > 1 ? "s": ""}` : ''}</span>
        </div>
        <span className="font-bold tracking-tight text-nowrap overflow-hidden text-ellipsis">{airing_period}</span>
        <span className="font-bold tracking-tight text-nowrap overflow-hidden text-ellipsis">{title}</span>
      </div>
    </div>
  )
}

function App() {

  const { hash } = useParams()
  const [data, setData] = useState([])
  const [message, setMessage] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [shareableURL, setShareableURL] = useState("")

  const selected = useRef([])

  const selectedNoneHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  const url = new URL(`${import.meta.env.VITE_API_URL}/anime`)

  useEffect(() => {
    if (data.length === 0) {
      url.search = new URLSearchParams(
        hash != undefined && hash != selectedNoneHash
          ? { hash: hash, offset: 0, limit: 20 }  
          : { offset: 0, limit: 20 }
      )
      fetch(url).then(
        response => response.json()
      ).then(
        response => {
          setData([...data, ...response])
          if (hash != undefined && hash != selectedNoneHash) {
            selected.current = [...selected.current, ...response.map(value => value.id)]
          }
        }
      ).catch(
        error => console.error(error)
      )
    } else {
      setMessage("That's all for now!")
      setTimeout(() => {
        setMessage("")
      }, 3000)
    }

  }, [])

  function getShareableURL(text) {
    const encodedText = new TextEncoder().encode(text)
    compress(encodedText).then(
      (compressedText) => {
        fetch(`${import.meta.env.VITE_API_URL}/url`, {
          method: 'POST',
          body: compressedText
        }).then(
          response => response.text()
        ).then(
          response => setShareableURL(
            `${import.meta.env.VITE_BASE_URL}/${response.slice(1, response.length - 1)}`
          )
        )
      })
  }

  // https://blog.logrocket.com/guide-pagination-load-more-buttons-infinite-scroll
  window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      if (data.length < 1000) {
        url.search = new URLSearchParams(
          hash != undefined && hash != selectedNoneHash
            ? { hash: hash, offset: data.length, limit: Math.max(10, 100 - data.length) }  
            : { offset: data.length, limit: Math.max(10, 100 - data.length) }
        )
        fetch(url).then(
          response => response.json()
        ).then(
          response => {
            setData([...data, ...response])
            if (hash != undefined && hash != selectedNoneHash) {
              selected.current = [...selected.current, ...response.map(value => value.id)]
            }
          }
        ).catch(
          error => console.error(error)
        )
      } else {
        setMessage("That's all for now!")
        setTimeout(() => {
          setMessage("")
        }, 3000)
      }
    }
  }

  return (
    <>
      <div className="font-['Atkinson_Hyperlegible'] fixed bottom-2 left-2 right-2 z-10 flex flex-col items-center justify-center gap-2">
        <div className={`${showModal ? "w-full max-w-[320px] bg-slate-50 border-2 border-slate-950 flex flex-col items-center justify-center gap-2 p-2": "hidden"}`}>
          <a href="https://github.com/er-knight/animeshare" target="_blank" className="text-2xl tracking-tighter decoration-slate-300 hover:underline hover:decoration-slate-950 text-slate-950">animeshare</a>
          <div className="w-full flex gap-2">
            <input className="border-2 border-slate-950 px-2 tracking-tight grow" readOnly={true} value={shareableURL}></input>
            <button className="border-2 border-slate-950 px-2 tracking-tight" onClick={() => navigator.clipboard.writeText(shareableURL)}>copy</button>
          </div>
        </div>
        <button type="button"
          onClick={() => {
            getShareableURL(selected.current.sort((a, b) => a - b).map(value => value.toString()).join(" "))
            setShowModal(!showModal)
          }} 
          className="inline-flex items-center px-2 gap-1 text-2xl tracking-tight bg-slate-50 border-2 border-slate-950"
        >
          share
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path d="M7 7h8.586L5.293 17.293l1.414 1.414L17 8.414V17h2V5H7v2z" />
          </svg>
        </button>
      </div>
      <div className="font-['Atkinson_Hyperlegible'] grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))]"
      >
        {
          data.map(value => <Card 
            key={value.id} 
            id={value.id} 
            title={value.title} 
            type={value.type}
            episodes={value.episodes}
            image_url={value.image_url} 
            airing_period={value.airing_period}
            rank={value.rank}
            rating={value.rating}
            selected={selected}
          ></Card>)}
      </div>
      <span
        className={
          `font-['Atkinson_Hyperlegible'] fixed w-full text-center text-xl bottom-1 ${message !== '' ? 'animate-fade' : ''}`
        }
      >{message}</span>
    </>
  )
}

export default App
