import { fabric } from 'fabric';
const strokeColor = '#3a86ff';
const fillColor = '#ffffff';
const lineWidth = 1.5;
export function drawCircleIcon(ctx, left, top, __styleOverride, fabricObject) {
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.fillRect(-6, -6, 12, 12);
    ctx.strokeRect(-6, -6, 12, 12);
    ctx.restore();
}
export function drawVerticalLineIcon(ctx, left, top, _styleOverride, fabricObject) {
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.fillRect(-2, -7, 4, 14);
    ctx.strokeRect(-2, -7, 4, 14);
    ctx.restore();
}
export function drawHorizontalLineIcon(ctx, left, top, _styleOverride, fabricObject) {
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.fillRect(-7, -2, 14, 4);
    ctx.strokeRect(-7, -2, 14, 4);
    ctx.restore();
}
export function drawRotateIcon(ctx, left, top, _styleOverride, _fabricObject) {
    const radius = 6;
    let lineWidth = radius / 3;
    let arrowWidth = radius / 2;
    const center = {
        x: left,
        y: top
    };
    let arrow1 = {
        startAngle: (1 / 2) * Math.PI + 0.6,
        endAngle: (3 / 2) * Math.PI
    };
    let arrow2 = {
        startAngle: (3 / 2) * Math.PI + 0.6,
        endAngle: (1 / 2) * Math.PI
    };
    function draw(startAngle, endAngle) {
        ctx.beginPath();
        ctx.shadowBlur = 0;
        ctx.arc(center.x, center.y, radius, startAngle, endAngle);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
        ctx.beginPath();
        let arrowTop = getPointOnCircle(center, radius, endAngle + 0.4);
        ctx.moveTo(arrowTop.x, arrowTop.y);
        let arrowLeft = getPointOnCircle(center, radius - arrowWidth, endAngle);
        ctx.lineTo(arrowLeft.x, arrowLeft.y);
        let arrowRight = getPointOnCircle(center, radius + arrowWidth, endAngle);
        ctx.lineTo(arrowRight.x, arrowRight.y);
        ctx.fillStyle = '#000000';
        ctx.closePath();
        ctx.fill();
    }
    function getPointOnCircle(center, radius, angle) {
        let pX = center.x + Math.cos(angle) * radius;
        let pY = center.y + Math.sin(angle) * radius;
        return { x: pX, y: pY };
    }
    ctx.save();
    ctx.translate(0, 0);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'black';
    ctx.fill();
    ctx.closePath();
    draw(arrow1.startAngle, arrow1.endAngle);
    draw(arrow2.startAngle, arrow2.endAngle);
    ctx.restore();
}