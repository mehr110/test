/* global THREE */
import _ from 'lodash';

import {EPS} from './math';

export function wallAtPoint(point) {
    const walls = document.querySelectorAll('a-entity[io3d-wall]');
    const wall = _.find(walls, wall => {
        const size = wall.getAttribute('io3d-wall');

        const objectSpace = new THREE.Matrix4();
        objectSpace.getInverse(wall.object3D.matrix);

        const local = point
        .clone()
        .applyMatrix4(objectSpace);

        wall.frontface = local.z < EPS;

        return (
            local.x > -EPS
            && local.y > -EPS
            && local.z > -EPS
            && local.x < size.l + EPS
            && local.y < size.h + EPS
            && (local.z < EPS || Math.abs(local.z - size.w) < EPS)
        );
    });

    return wall;
}

export function wallNormal(wall) {
    const n = new THREE.Vector3(0, 0, -1);
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.extractRotation(wall.object3D.matrix);
    n.applyMatrix4(rotationMatrix);
    return n;
}

export function placeOnWall(wall, object, position, width, height) {
    const objectSpace = new THREE.Matrix4();
    objectSpace.getInverse(wall.object3D.matrix);

    const local = position
    .clone()
    .applyMatrix4(objectSpace);

    const frontface = local.z < EPS;

    const norm = wallNormal(wall);
    if(!frontface) {
        norm.multiplyScalar(-1);
    }

    const offset = norm.multiplyScalar(0.01).add(position);
    let rotation = wall.getAttribute('rotation');
    if(frontface) {
        rotation = {
            x: rotation.x,
            y: rotation.y + 180,
            z: rotation.z
        };
    }
    object.setAttribute('rotation', rotation);
    object.setAttribute('position', offset);
    object.setAttribute('width', width);
    object.setAttribute('height', height);
}