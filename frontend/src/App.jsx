import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"


async function compress(data) {
  const compressionStream = new CompressionStream('gzip')
  const writer = compressionStream.writable.getWriter()
  writer.write(data)
  writer.close()
  return new Response(compressionStream.readable).arrayBuffer()
}

function copyShareableURL(text) {
  const encodedText = new TextEncoder().encode(text)
  compress(encodedText).then(
    (compressedText) => {
      fetch("http://localhost:8000/url", {
        method: 'POST',
        body: compressedText
      }).then(
        response => response.text()
      ).then(
        response => (
          navigator && navigator.clipboard && navigator.clipboard.writeText
        ) ? navigator.clipboard.writeText(`http://localhost:8000/${response.slice(1, response.length - 1)}`) : null
      )
    })
}

function Card({ id, title, selected }) {
  const [isSelected, setIsSelected] = useState(selected.current.includes(id))
  return (
    <div
      onClick={() => {
        setIsSelected(!isSelected)
        selected.current = isSelected
          ? selected.current.filter(value => value != id)
          : [...selected.current, id]
      }}
      className={
        `h-64 md:h-80 p-1 min-[425px]:h-[22rem] border ${isSelected ? 'bg-green-600' : ''} hover:border-slate-600`
      }
    >
      {/* {`Card #${id.toString().padStart(3, '0')}`} */}
      {`#${id} - ${title}`}
    </div>
  )
}

function App() {

  const { hash } = useParams()
  const [data, setData] = useState([])
  const [message, setMessage] = useState("")
  const selected = useRef([])

  const selectedNoneHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  const url = new URL("http://localhost:8000/anime")

  useEffect(() => {
    if (data.length === 0) {
      // setData([...data, ...Array.from({ length: 20 }, (_, index) => data.length + index + 1)])
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

  // https://blog.logrocket.com/guide-pagination-load-more-buttons-infinite-scroll
  window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      if (data.length < 1000) {
        // setData([...data, ...Array.from({ length: Math.max(10, 100 - data.length) }, (_, index) => data.length + index + 1)])
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
  };

  return (
    <>
      <button type="button"
        onClick={() => copyShareableURL(selected.current.sort((a, b) => a - b).map(value => value.toString()).join(" "))}
        className="font-['Atkinson_Hyperlegible'] inline-flex items-center gap-1 fixed top-2 right-2 text-2xl bg-orange-400 pl-2 pr-2 hover:border hover:border-slate-600"
      >
        share
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <path d="M7 7h8.586L5.293 17.293l1.414 1.414L17 8.414V17h2V5H7v2z" />
        </svg>
      </button>
      <div
        className="font-['Atkinson_Hyperlegible'] grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7  gap-1 p-1"
      >
        {/* {data.map(value => <Card key={value} id={value}></Card>)} */}
        {data.map(value => <Card key={value.id} id={value.id} title={value.title} selected={selected}></Card>)}
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
