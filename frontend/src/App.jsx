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
      className={`relative text-black bg-slate-50 border border-gray rounded-lg min-h-[240px] h-[calc((100vw/160px)*1.5px)] hover:cursor-pointer p-2`}
    >
      <div className="absolute top-2 left-2 flex items-center justify-between m-2 bg-white rounded-md px-2">
        <span>{rank}</span>
      </div>
      <div className="absolute top-2 right-2 flex items-center justify-center m-2 bg-white rounded-md p-1">
        {
          isSelected 
            ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4">
                <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" fill="#db2777"></path>
              </svg>
            : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4">
                <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" fill="#475569"></path>
              </svg>
        }
      </div>
      <img src={image_url} className="w-full h-[calc(100%-24px)] object-cover rounded-lg"></img>
      <div className="pt-1 w-full text-nowrap overflow-hidden text-ellipsis">
        <span className="tracking-tight">{title}</span>
      </div>

      {/* <div className={
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
      </div> */}
    </div>
  )
}

function App() {

  const { hash } = useParams()
  const [data, setData] = useState([])
  const [message, setMessage] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [shareableURL, setShareableURL] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")

  const dataOver = useRef(false)
  const selected = useRef([])

  const selectedNoneHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  const url = new URL(`${import.meta.env.VITE_API_URL}/anime`)

  useEffect(() => {
    url.search = new URLSearchParams(
      hash != undefined && hash != selectedNoneHash
        ? { hash: hash, offset: 0, limit: 50 }
        : { offset: 0, limit: 50 }
    )
    if (!dataOver.current) {
      fetch(url).then(
        response => response.json()
      ).then(
        response => {
          if (response.length == 0) {
            dataOver.current = true
            return
          }
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
      url.search = new URLSearchParams(
        hash != undefined && hash != selectedNoneHash
          ? { hash: hash, offset: data.length, limit: 50 }
          : { offset: data.length, limit: 50 }
      )
      if (!dataOver.current) {
        fetch(url).then(
          response => response.json()
        ).then(
          response => {
            if (response.length == 0) {
              dataOver.current = true
              return
            }
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

  function handleSearch(event) {
    if (event.key === "Enter") {
      url.search = new URLSearchParams(
        { keyword: searchKeyword }
      )
      fetch(url).then(
        response => response.json()
      ).then(
        response => {
          console.log(response)
          setData(response)
        }
      ).catch(
        error => console.error(error)
      )
    }
  }

  return (
    <>
      <span
        className={
          `font-['Bricolage_Grotesque'] fixed w-full z-20 text-center text-xl top-2 ${message !== '' ? 'animate-fade' : ''}`
        }
      >{message}</span>
      <div className="p-2 pb-0 flex items-center justify-center">
        <input type="text" className="font-['Bricolage_Grotesque'] w-full max-w-[320px] text-xl border rounded-lg outline-none px-2 py-1" value={searchKeyword} onChange={(event) => setSearchKeyword(event.target.value)} onKeyUp={handleSearch}></input>
      </div>
      <div className="font-['Bricolage_Grotesque'] fixed bottom-2 left-2 right-2 z-10 flex flex-col items-center justify-center gap-2">
        <div className={`${showModal ? "w-full max-w-[320px] bg-white border rounded-lg border-gray flex flex-col items-center justify-center gap-2 p-4" : "hidden"}`}>
          <a href="https://github.com/er-knight/animeshare" target="_blank" className="text-2xl tracking-tighter decoration-slate-300 hover:underline hover:decoration-slate-950 text-slate-950">AnimeShare</a>
          <div className="w-full flex gap-2">
            <input className="border rounded-md border-gray text-lg px-2 tracking-tight grow outline-none" readOnly={true} value={shareableURL}></input>
            <button className="border rounded-md border-gray text-lg px-2 tracking-tight" onClick={() => navigator.clipboard.writeText(shareableURL)}>Copy</button>
          </div>
        </div>
        <button type="button"
          onClick={() => {
            console.log(selected)
            getShareableURL(selected.current.sort((a, b) => a - b).map(value => value.toString()).join(" "))
            setShowModal(!showModal)
          }}
          className="inline-flex items-center justify-center px-2 py-1 w-full max-w-[calc(320px/2)] gap-1 text-2xl tracking-tight bg-white border rounded-lg border-gray"
        >Share</button>
      </div>
      <div className="font-['Bricolage_Grotesque'] grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] p-2 gap-2"
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
    </>
  )
}

export default App
