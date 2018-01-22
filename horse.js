//Инструменты для отрисовки
class Point {
    constructor(x, y) {
        x,
        y
    }
}

class Game {
    constructor(canvasWidth, canvasHeight, deskWidth, deskHeight) {
        //Создаём игровую доску
        this.desk = new Desk(deskWidth, deskHeight),
        //Создаём холст для отрисовки
        this.canvas = document.createElement('canvas')
        //Заливаем наш холст в DOM
        document.body.appendChild(this.canvas)
        
        this.canvas.width = canvasWidth
        this.canvas.height = canvasHeight

        this.cellSize = Math.round(Math.min( canvasWidth / deskWidth, canvasHeight / deskHeight ))

        this.ctx = this.canvas.getContext('2d')

        this._printFields()
    }
    clean() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    getFieldCenter(F) {
        return {
            x: this.cellSize * F.x + this.cellSize * 0.5,
            y: this.cellSize * F.y + this.cellSize * 0.5
        }
    }
    getFieldByPoint(click) {
        return {
            x: Math.round(click.x / this.cellSize),
            y: Math.round(click.y / this.cellSize)
        }
    }
    _printFields() {
        //Горизонтальные

        for (let i = 0; i < this.desk.height + 1; i++) {
            for (let j = 0; j < this.desk.width + 1; j++) {
                this.printLine( {
                    y: 0,
                    x: i * this.cellSize
                } , {
                    y: this.desk.height * this.cellSize,
                    x: i * this.cellSize
                } )
                if(i < this.desk.height) this.ctx.fillText(i, i * this.cellSize + 0.5 * this.cellSize, this.cellSize * 0.15 )
                
                this.printLine( {
                    x: 0,
                    y: i * this.cellSize
                } , {
                    x: this.desk.width * this.cellSize,
                    y: i * this.cellSize
                } )
                if(i < this.desk.width) this.ctx.fillText(i, this.cellSize * 0.1, i * this.cellSize + 0.5 * this.cellSize)
                
                this.ctx.fillStyle = 'rgba(0, 150, 150, 0.1)'

                if((i + j) % 2 == 0 && i < this.desk.width && j < this.desk.height) this.ctx.fillRect(i * this.cellSize, j * this.cellSize, this.cellSize, this.cellSize)
            }            
        }
    }
    //start, finish - точки { x, y }
    printLine(st, fin) {
        this.ctx.fillStyle = '#000'
        this.strokeStyle = '#000'
        let P = this.ctx
        P.beginPath()
        P.moveTo(st.x, st.y)
        P.lineTo(fin.x, fin.y)
        P.closePath()
        P.stroke()
    }
    printTrack(trackToArray) {
        this.ctx.fillStyle = '#000'
    
        this.clean()
        this._printFields()

        console.log(trackToArray)

        this.ctx.fillStyle = '#FF0000'

        let center = this.getFieldCenter(trackToArray[0])

        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, this.cellSize * 0.15, 0, 360, false)
        this.ctx.closePath()
        this.ctx.fill()
        
        this.ctx.beginPath();
        this.ctx.moveTo(center.x, center.y)
        
        //TODO: Отрисовка настоящего коня
        
        for (const f of trackToArray) {
            var coord = this.getFieldCenter(f)
            this.ctx.lineTo(coord.x, coord.y)
        }

        
        this.ctx.stroke()
        
        for (const f of trackToArray) {
            var coord = this.getFieldCenter(f)
            this.ctx.fillStyle = '#000'
            this.ctx.beginPath();
            this.ctx.arc(coord.x, coord.y, this.cellSize * 0.1, 0, 360, false)
            this.ctx.closePath()
            this.ctx.fill()
        }


        this.ctx.fillStyle = '#0F0'
        this.ctx.beginPath();
        this.ctx.arc(coord.x, coord.y, this.cellSize * 0.2, 0, 360, false)
        this.ctx.closePath()
        this.ctx.fill()

        this.ctx.stroke()
        
        
    }
}

//Описываем предметную область
//Игровая доска 
class Desk {
    constructor(width, height) {
        this.width = width,
        this.height = height,
        this.fields = []

        for ( let i = 0; i < this.width; i += 1 ) {
            for ( let j = 0; j < this.height; j += 1 ) {
                this.fields.push(new Field(i, j))
            }
        }
    }
}
//Квадрат игровой доски
class Field {
    constructor(horizontal_position, vertical_position) {
        this.x = horizontal_position, //слева направо
        this.y = vertical_position //сверху вниз
    }
    getId() {
        return `#${this.x}|${this.y}`
    }
}

//Маршрут
class Track {
    constructor(start, fields) {
        this.track = {}
        this.steps = 0
        fields.map((val) => {
            val.wasHere = false
            val.order = null
            this.track[val.getId()] = val 
        })
        this.doStep(start)
    }
    toArray() {
        let history = []

        for (const field in this.track) {
            if(this.track[field].wasHere) history.push({
                order: this.track[field].order,
                id: this.track[field].getId(),
                x: this.track[field].x,
                y: this.track[field].y
            })
        }

        return history.sort((a, b) => {
            if(a.order > b.order) return 1
            if(a.order < b.order) return -1
            return 0
        })
    }
    toString() {
        return Array.from(this.toArray(), (f) => { return f.id }).join(' > ')
    }

    doStep(field) {
        this.steps++
        this.track[field.getId()].wasHere = true
        this.track[field.getId()].order = this.steps
    }
}

class Horse {
    constructor(startPosition, fields) {
        this.currentTrack = new Track(startPosition, fields)
    }
    getCurrentPos() {
        return this.currentTrack.toArray().pop()
    }
    
    getAvSteps(pos, fields) {
        return fields.filter((field, idx) => {
            if(this.currentTrack.track[field.getId()].wasHere == true) return false
            if(Math.abs(pos.x - field.x) == 2 && Math.abs(pos.y - field.y) == 1) return true
            if(Math.abs(pos.x - field.x) == 1 && Math.abs(pos.y - field.y) == 2) return true
            return false
        })
    }
}

//Объект для хранения найденных путей
var Tracks = {}

let G = new Game(800, 600, 8, 8)

console.log(G.desk)

let H = new Horse(G.desk.fields[Math.floor(Math.random() * (64 - 0 + 1))], G.desk.fields)

const VARNSDORF = (horse) => {
    let avaliable = horse.getAvSteps(horse.currentTrack.toArray().pop(), G.desk.fields)
    let with_grades = avaliable.map((val) => {
        return {
            field: val,
            grade: horse.getAvSteps(val, G.desk.fields).length
        }
    })
    with_grades.sort((a, b) => {
        if(a.grade > b.grade) return 1
        if(a.grade < b.grade) return -1
        return 0
    })
    return with_grades[0].field    
}

let Cycle = setInterval(() => {
    try {
        H.currentTrack.doStep(VARNSDORF(H), G.desk.fields)
        G.printTrack(H.currentTrack.toArray())
    } catch (error) {
        G.printTrack(H.currentTrack.toArray())
        console.log(error)
        clearInterval(Cycle)
        console.log(H.currentTrack.toString())
        console.log(H.currentTrack.toArray())
    }
    
}, 900)
