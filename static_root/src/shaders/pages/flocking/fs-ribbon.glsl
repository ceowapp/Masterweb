uniform vec3 lightPos;

uniform sampler2D t_audio;
uniform sampler2D t_normal;
uniform sampler2D t_ribbon;
uniform sampler2D t_matcap;

const int numOfCoral = @SIZE;

uniform vec4 coralData[numOfCoral];
uniform mat3 normalMatrix;

varying float vDepth;

varying vec2 vRibbonUV;
varying vec2 vLookupUV;
varying float vAmount;

varying vec3 vEye;
varying vec3 vPos;
varying vec3 vMPos;
varying vec3 vMVPos;

varying vec3 vNormal;



//varying vec3 vLightVec;

$uvNormalMap
$semLookup

void main(){

  //vec3 col = vec3( 1. , .3 , .3 );
  vec4 col = vec4( 0. );


  vec4 nCol =  vec4( (vNormal * .5 + .5) , 1.);

  vec2 uv = ( vRibbonUV + vec2( 0. , 1. ) ) * vec2( 1. , .25);
  vec2 offset = vLookupUV;
  vec3 normal = uvNormalMap( t_normal , vPos , uv , vNormal , .1 , .2 , offset * 5.15123465);



  vec2 semUV = semLookup( normalize( vMVPos ) , normalize(normalMatrix * normal) );

  vec4 semCol = texture2D( t_matcap , semUV);

  vec3 lightVec = vMPos - lightPos;
  vec3 lightDir = normalize(lightVec);

  float lightDist = length( lightVec );

  vec3 lightRefl = reflect( lightDir , normal );

  float spec = max( 0. , dot( lightRefl , vEye  ) );

  float lambert = max( 0. , dot( lightDir , normal ) );
  nCol =  vec4( (normal * .5 + .5) , 1.); 
  //vec4 col = vec4( vec3( pow( abs( dot( vNormal , vEye ) ), 100. )),1.); 
  //vec4 col = vec4( vec3( pow( abs( dot( vNormal , vEye ) ), 100. )),1.); 

  if( vAmount < .01 ){

    col = vec4( 1. , 1. , 1. , 0. );

  }


  /*if( vRibbonUV.y > .8 || vRibbonUV.y < -.8 ||  vRibbonUV.x < .1  ){

    col = nCol;//nCol; //vec4( 1. , 1.  , 1. , 1. );

  }else{*/
    
    col = nCol;// nCol * pow( dot( vNormal , normalize(vEye) ) , 1. );

 // }

  //vec4 norm = texture2D( t_normal , vRibbonUV * .5 );
  vec4 ribbon = texture2D( t_ribbon ,( vRibbonUV + vec2( 0. , 1. ) ) * vec2( 1. , .25));
  vec4 aColor = texture2D( t_audio , vec2( abs(sin(spec * 10.)) , 0. ) );

  if( (vRibbonUV.x , .3) * .2 > vRibbonUV.y * vRibbonUV.y * vRibbonUV.y* vRibbonUV.y ){

    discard;
  }

  float coralPower = 0.;

  for( int i = 0; i < numOfCoral; i++ ){

    vec3 dif = coralData[i].xyz - vMPos;
    float dist = length( dif );

    coralPower += coralData[i].w  * 1000. / (dist * dist);


  }

  gl_FragColor = (semCol + vec4(aColor.xyz, 1.)) * vec4( vec3( 1. ) , .3 );

 // gl_FragColor = vec4( 1. );

}
