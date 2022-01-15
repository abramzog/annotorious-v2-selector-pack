import Tool from '@recogito/annotorious/src/tools/Tool';
import RubberbandMultipolygon from './RubberbandMultipolygon';
import EditableMultipolygon from './EditableMultipolygon';

/**
 * A rubberband selector for Multipolygon fragments.
 */
export default class RubberbandMultipolygonTool extends Tool {

  constructor(g, config, env) {
    super(g, config, env);
    this._isDrawing = false;
    document.addEventListener('keydown', evt => {
      console.log("keyDown Driggered",evt);
      if (evt.key == "z" && evt.ctrlKey) {
        // console.log("doing undo");
        this.undo();
      }
      if (evt.key == 'n') {
        console.log("n recognized");
        this.newPart();
      }
    });  }

  startDrawing = (x, y) => {
    this._isDrawing = true;
    
    this.attachListeners({
      mouseMove: this.onMouseMove,
      mouseUp: this.onMouseUp,
      dblClick: this.onDblClick
    });
    
    this.rubberband = new RubberbandMultipolygon([ x, y ], this.g, this.env);
  }

  stop = () => {
    this.detachListeners();
    
    this._isDrawing = false;

    if (this.rubberband) {
      this.rubberband.destroy();
      this.rubberband = null;
    }
  }
  undo = () =>{
    // console.log("rubberband undo",this.rubberband);
    if (this.rubberband){
      this.rubberband.undo();

    }
    //console.log(this);
  }
  newPart = () =>{
    if (this.rubberband){
      this.rubberband.newPart();

    }
    //console.log(this);
  }

  onMouseMove = (x, y) =>
    this.rubberband.dragTo([ x, y ]);

  onMouseUp = (x, y, evt) => {
    console.log("mouse up", evt);
    if (evt.altKey){
      this.onDblClick(evt);
    } else if (evt.ctrlKey) {
      this.rubberband.undo();
    } else{
      const { width, height } = this.rubberband.getBoundingClientRect();

      const minWidth = this.config.minSelectionWidth || 4;
      const minHeight = this.config.minSelectionHeight || 4;
      
      if (width >= minWidth || height >= minHeight) {
        this.rubberband.addPoint([ x, y ]);
      } else {
        this.emit('cancel');
        this.stop();
      }
    }
  }
  
  onDblClick = (x, y) => {
    this._isDrawing = false;

    this.rubberband.addPoint([ x, y ]);

    const shape = this.rubberband.element;
    shape.annotation = this.rubberband.toSelection();
    this.emit('complete', shape);

    this.stop();
  }

  get isDrawing() {
    return this._isDrawing;
  }

  get isDrawing() {
    return this._isDrawing;
  }

  createEditableShape = annotation => 
    new EditableMultipolygon(annotation, this.g, this.config, this.env);

}

RubberbandMultipolygonTool.identifier = 'multipolygon';

RubberbandMultipolygonTool.supports = annotation => {
  const selector = annotation.selector('SvgSelector');
  if (selector)
    return selector.value?.match(/^<svg.*<path d=/g);
}