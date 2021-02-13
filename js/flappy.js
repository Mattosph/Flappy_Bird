function newElement(tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
    //Constructor function that builds new elements
}

function barrier(Breverse = false){
    this.BarrierElement = newElement('div','barrier')//creates a div for barrier and ads its class barrier
    //creates new barrier for the bottom position

    const BarrierBorder = newElement('div', 'barrier-border')
    const BarrierBody = newElement('div', 'barrier-body')
    this.BarrierElement.appendChild(Breverse ? BarrierBody : BarrierBorder)
    this.BarrierElement.appendChild(Breverse ? BarrierBorder : BarrierBody)

    this.setHeight = BarrierHeight => BarrierBody.style.height = `${BarrierHeight}px`

}

function PairOfBarriers(height, gap, x){
this.BarrierElement = newElement ('div', 'barriers-pair')

this.TopBarrier = new barrier(true)
this.BottomBarrier = new barrier(false)

this.BarrierElement.appendChild(this.TopBarrier.BarrierElement)
this.BarrierElement.appendChild(this.BottomBarrier.BarrierElement)
//all barriers elements are universally accessible by .this cause they are needed
//to calculate bird collision

//Generating randomic gaps between barriers
this.SortGap = () => {
    const TopHeight = Math.random() * (height - gap)
    const BottomHeight = height - gap - TopHeight
    this.TopBarrier.setHeight(TopHeight)
    this.BottomBarrier.setHeight(BottomHeight)
    }
this.getX = () => parseInt(this.BarrierElement.style.left.split('px')[0])
// Takes the x position of a barrier

this.setX = x => this.BarrierElement.style.left = `${x}px`
//Shift the barrier's x position 

this.getWidth = () => this.BarrierElement.clientWidth
//Takes the width of barriers 

this.SortGap()
this.setX(x)
}

// //testing
// const b = new PairOfBarriers(700,200,400)
// document.querySelector('[wm-flappy]').appendChild(b.BarrierElement)


//Barriers function animates and generates new barriers
function Barriers (BarrierHeight, BarrierWidth, Gap, Space, NotifyPoint){
    this.pairs = [
        new PairOfBarriers (BarrierHeight, Gap, BarrierWidth),//The 1st barrier start from right out of game area
        new PairOfBarriers (BarrierHeight, Gap, BarrierWidth + Space),
        new PairOfBarriers (BarrierHeight, Gap, BarrierWidth + Space*2),
        new PairOfBarriers (BarrierHeight, Gap, BarrierWidth + Space*3)
    ]

    const displacement = 3 // constant of the barriers displacement speed
    this.animate=()=> {
        this.pairs.forEach(pair =>{
        pair.setX(pair.getX()-displacement)

            if(pair.getX() < -pair.getWidth()){// detects if the width became negative to generate a new barrier
                pair.setX(pair.getX() + Space * this.pairs.length)// Set a new X position to the new barriers
                pair.SortGap()//Generates new gaps for the barriers to come
            }

            const mid = BarrierWidth/2
            const midCross = pair.getX() + displacement>= mid 
             && pair.getX() < mid
            if(midCross) NotifyPoint()

        })
    }
}

function BirdAnimation(gameHeight){
    let flying = false

    this.BirdElement = newElement('img', 'bird')
    this.BirdElement.src = 'imgs/BirdPic.png'

    this.getY = () => parseInt(this.BirdElement.style.bottom.split('px')[0])
    this.setY = y => this.BirdElement.style.bottom= `${y}px`

    window.onkeydown = e => flying = true // detects the keyboard inputs to make the bird fly
    window.onkeyup = e => flying = false

    this.AnimateBird = () => {
        const newY = this.getY() + (flying ? 8 : -5)//Flies up 8px, Flies down -5px
        const maxHeight = gameHeight - this.BirdElement.clientHeight

            if (newY <= 0){
                this.setY(0) //set the bottom limits to 0 from the game area
            } else if (newY >= maxHeight){
                this.setY(maxHeight)
            } else {
                this.setY(newY)
            }
        }

    this.setY(gameHeight / 2) //sets the initial Bird height
}

function gameProgress(){
    this.ProgressElement = newElement('span', 'progress')
    this.updatePoints = points => {
        this.ProgressElement.innerHTML = points
    }
    this.updatePoints(0)
}

//checking Bird/Barriers collision
function AreOverlaid(elementA, elementB){
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    //checks for the width collision
    const horizontal = a.left + a.width >= b.left
    && b.left + b.width >= a.left

    //Checks for vertical collision
    const vertical = a.top + a.height >= b.top
    && b.top + b.height >= a.top
    return horizontal && vertical
}

function collision(Bird, Barriers) {
    let collided = false
    Barriers.pairs.forEach(PairOfBarriers => {
        if (!collided) {
            const top = PairOfBarriers.TopBarrier.BarrierElement
            const bottom = PairOfBarriers.BottomBarrier.BarrierElement
            collided = AreOverlaid(Bird.BirdElement, top) 
            || AreOverlaid(Bird.BirdElement, bottom) 

        }
    })
    return collided
}

//Function to append barriers and the bird and animate the game
function FlappyBird() { 
    let points = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const Height = gameArea.clientHeight
    const Width = gameArea.clientWidth

    const PointProgress = new gameProgress()
    const gameBarriers = new Barriers(Height, Width,200,400,
    () => PointProgress.updatePoints(++points))
    const gameBird = new BirdAnimation(Height)

    gameArea.appendChild(PointProgress.ProgressElement)
    gameArea.appendChild(gameBird.BirdElement)
    gameBarriers.pairs.forEach(pair => gameArea.appendChild(pair.BarrierElement))

    this.start = () => {
        const gameTimer = setInterval(() =>{
            gameBarriers.animate()
            gameBird.AnimateBird()

            if(collision(gameBird, gameBarriers)){
                clearInterval(gameTimer)
            }
        },20)
    }
}

new FlappyBird().start()