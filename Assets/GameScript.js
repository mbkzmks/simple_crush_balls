#pragma strict
import UnityEngine.UI;

public
var ballPrefab: GameObject; 
public
var lineRenderer: LineRenderer;
public
var sparkSound : AudioClip;
public
var dropSound : AudioClip;
public
var scoreText: Text;
public
var timerText: Text;
public
var nowEffectObj:GameObject;

private
var ballMaterialsColor: Color[] = [Color.red,Color.blue,Color.yellow,Color.black,Color.white];
private
var sound : AudioSource;
private
var line: LineRenderer;
private
var firstBall: GameObject; 
private
var removableBallList: Array; 
private
var lastBall: GameObject;
private
var currentName: String;
private
var isPlaying: boolean = false;
private
var timeLimit: int = 60;
private
var countTime: int = 5; 
private
var currentScore: int = 0;

function Start () {
  sound = GetComponent(AudioSource);
  sound.PlayOneShot(dropSound);
  CountDown();
  DropBall(55);

}

function Update () {
if(isPlaying){
  if (Input.GetMouseButton(0) && firstBall == null) {
    OnDragStart();
  } else if (Input.GetMouseButtonUp(0)) {
    OnDragEnd();
  } else if (firstBall != null) {
    OnDragging();
  }
   scoreText.text = "Score:" + currentScore.ToString();
  }
 
}
 
private
function DropBall(count: int) {
  var ball: GameObject;
  for (var i = 0; i < count; i++) {
    ball = Instantiate(ballPrefab);
    ball.transform.position.x = Random.Range(-2.0, 2.0);
    ball.transform.position.y = 7; 
    ball.transform.eulerAngles.z = Random.Range(-40, 40);
    var spriteId: int = Random.Range(0, 5); 
    ball.name = "Ball" + spriteId;
    ball.GetComponent(Renderer).material.color = ballMaterialsColor[spriteId];

    yield WaitForSeconds(0.05); 
  }
}

private
function OnDragStart() {
  var col = GetCurrentHitCollider();
  if (col != null) {
      var colObj = col.gameObject;
    if (colObj.name.IndexOf("Ball") != -1) {
      removableBallList = new Array();
      firstBall = colObj;
      currentName = colObj.name; 
      PushToList(colObj);
    }
  }
}
 
private
function OnDragEnd() {
  if (firstBall != null) {
    var length = removableBallList.length;
    if (length >= 3) {
      for (var i = 0; i < length; i++) {
      var listedBall2: GameObject = removableBallList[i];
       effectOn(listedBall2.transform.position);
       Destroy(removableBallList[i]); 
      }
      sound.PlayOneShot(sparkSound);
      currentScore += (CalculateBaseScore(length) + 50 * length);
      DropBall(length);
    } else {
      for (var j = 0; j < length; j++) {
        var listedBall: GameObject = removableBallList[j];
        ChangeColor(listedBall, 1.0);
        listedBall.name = listedBall.name.Substring(1, 5);
      }
    }
    firstBall = null; 
    line.SetVertexCount(0);

  }
}
 
private
function OnDragging() {
  var col = GetCurrentHitCollider();
  if (col != null) {
    var colObj = col.gameObject;
    if (colObj.name == currentName) {
      if (lastBall != colObj) {
        var dist = Vector3.Distance(lastBall.transform.position, colObj.transform.position);
        if (dist <= 1.5) {
          PushToList(colObj);
          if(line != null){
           line.SetVertexCount(0);
           }else{
           line = Instantiate(lineRenderer);
           }
          line.SetWidth(0.2f, 0.2f);
          line.SetVertexCount(removableBallList.length);
          var obj:GameObject;
          for(var i = 0; i < removableBallList.length; i++){
               obj = removableBallList[i];
              line.SetPosition(i, obj.transform.position);
          }                    
        }
      }
    }
  }
}

private 
function PushToList(obj: GameObject) {
  lastBall = obj;
  ChangeColor(obj, 0.5);
  removableBallList.push(obj);
  obj.name = "_" + obj.name;
}

private 
function GetCurrentHitCollider() {
  var ray = Camera.main.ScreenPointToRay (Input.mousePosition);
  var hit : RaycastHit;
  if(Physics.Raycast(ray, hit,100)){
  return hit.collider;
  }
  return null;
}

private
function ChangeColor(obj: GameObject, transparency: float) {
  obj.GetComponent(Renderer).material.color.a = transparency;
}

private
function CountDown() {
  while(timerText == null){
  yield WaitForSeconds(1); 
  }
  var count = countTime;
  while (count > 0) {
    timerText.text = count.ToString();
    yield WaitForSeconds(1);
    count -= 1;
  }
  timerText.text = "Start!";
  isPlaying = true;
  yield WaitForSeconds(1);
  StartTimer();
}

private
function StartTimer() {
  var count = timeLimit;
  while (count > 0) {
    timerText.text = count.ToString();
    yield WaitForSeconds(1);
    count -= 1;
  }
  timerText.text = "Finish";
  OnDragEnd();
  isPlaying = false;
}

public 
function Reset(){
  Application.LoadLevel("Main");
}

private
function CalculateBaseScore(num: int){
  var tempScore = 50 * num * (num+1) -300;
  return tempScore;
}

private
function effectOn(pos: Vector3){
	nowEffectObj = Instantiate(nowEffectObj);
	nowEffectObj.transform.position = pos;

}