import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import Message from '@/models/Message';
import CallSignal from '@/models/CallSignal';

export async function GET() {
    const report: any = {
        checks: [],
        status: 'PENDING'
    };

    try {
        await connectDB();
        report.checks.push({ name: 'DB Connection', status: 'PASS' });

        // 1. Setup Test Users
        const userA = 'test_user_a';
        const userB = 'test_user_b';

        await User.findOneAndUpdate({ username: userA }, { username: userA, answers: [], questions: [] }, { upsert: true, new: true });
        await User.findOneAndUpdate({ username: userB }, { username: userB, answers: [], questions: [] }, { upsert: true, new: true });
        report.checks.push({ name: 'User Creation', status: 'PASS' });

        // 2. Clean previous data
        await Message.deleteMany({
            $or: [
                { sender: userA, receiver: userB },
                { sender: userB, receiver: userA }
            ]
        });
        await CallSignal.deleteMany({ sender: { $in: [userA, userB] } });

        // 3. Test Messaging
        // Send
        await Message.create({ sender: userA, receiver: userB, content: 'TEST_MSG_123' });
        // Receive
        const messages = await Message.find({ sender: userA, receiver: userB });
        if (messages.length === 1 && messages[0].content === 'TEST_MSG_123') {
            report.checks.push({ name: 'Messaging (Send/Receive)', status: 'PASS' });
        } else {
            throw new Error('Messaging check failed');
        }

        // 4. Test Presence
        await User.findOneAndUpdate({ username: userA }, { lastSeen: new Date() });
        const userADoc = await User.findOne({ username: userA });
        const isOnline = userADoc?.lastSeen && (new Date().getTime() - new Date(userADoc.lastSeen).getTime() < 60000); // 1 min

        if (isOnline) {
            report.checks.push({ name: 'Presence (Online Status)', status: 'PASS' });
        } else {
            throw new Error('Presence check failed');
        }

        // 5. Test Call Signaling
        // Send Signal
        await CallSignal.create({ sender: userA, receiver: userB, type: 'invite', data: { sdp: 'fake' } });

        // Receive Signal (Simulate Poll)
        const signals = await CallSignal.find({ receiver: userB });
        if (signals.length > 0 && signals[0].type === 'invite') {
            // Delete (Simulate Read)
            await CallSignal.deleteMany({ _id: { $in: signals.map(s => s._id) } });

            // Verify Deletion
            const signalsAfter = await CallSignal.find({ receiver: userB });
            if (signalsAfter.length === 0) {
                report.checks.push({ name: 'Call Signaling (Queue/Delete)', status: 'PASS' });
            } else {
                throw new Error('Signal deletion failed');
            }
        } else {
            throw new Error('Signal retrieval failed');
        }

        report.status = 'SUCCESS';
        return NextResponse.json(report);

    } catch (error: any) {
        report.status = 'Visual Verification Required';
        report.error = error.message;
        report.checks.push({ name: 'Critical Failure', status: 'FAIL', error: error.message });
        return NextResponse.json(report, { status: 500 });
    }
}
